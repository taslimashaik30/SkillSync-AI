from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..core.dependencies import get_current_user
from ..database.database import get_db
from ..models import Assessment, AssessmentQuestion, AssessmentResult, Skill, User
from ..schemas.assessment import (AssessmentQuestionResponse, AssessmentResponse, AssessmentResultResponse, GenerateAssessmentRequest, SubmitAssessmentRequest, UploadMaterialResponse)
from ..services.mcq_generator import generate_mcqs_from_text
from ..services.pdf_extractor import extract_text_from_pdf
from ..services.competency import update_employee_skill_from_assessment

router = APIRouter(prefix="/api/assessments", tags=["assessments"])
UPLOADS_DIR = Path(__file__).resolve().parents[2] / "uploads"


def _safe_pdf_path(filename: str) -> Path:
    if Path(filename).name != filename or not filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only safe PDF filenames are allowed")
    return UPLOADS_DIR / filename


def _response(assessment: Assessment, questions: list[AssessmentQuestion]) -> AssessmentResponse:
    return AssessmentResponse(id=assessment.id, title=assessment.title, total_questions=assessment.total_questions, questions=[AssessmentQuestionResponse(id=q.id, question=q.question_text, options=[q.option_a, q.option_b, q.option_c, q.option_d]) for q in questions])


def _owned_assessment(assessment_id: int, user_id: int, db: Session) -> Assessment:
    assessment = db.scalar(select(Assessment).where(Assessment.id == assessment_id, Assessment.user_id == user_id))
    if assessment is None:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return assessment


@router.post("/upload-material", response_model=UploadMaterialResponse, status_code=201)
def upload_material(file: UploadFile = File(...), _: User = Depends(get_current_user)) -> UploadMaterialResponse:
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    UPLOADS_DIR.mkdir(exist_ok=True)
    filename = f"{uuid4().hex}.pdf"
    destination = UPLOADS_DIR / filename
    content = file.file.read()
    if not content:
        raise HTTPException(status_code=400, detail="PDF is empty")
    destination.write_bytes(content)
    return UploadMaterialResponse(filename=filename, message="Learning material uploaded successfully")


@router.post("/generate", response_model=AssessmentResponse, status_code=201)
def generate_assessment(payload: GenerateAssessmentRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> AssessmentResponse:
    skill = db.get(Skill, payload.skill_id)
    if skill is None:
        raise HTTPException(status_code=404, detail="Skill not found")
    text = extract_text_from_pdf(_safe_pdf_path(payload.pdf_filename))
    generated = generate_mcqs_from_text(text, skill.name, skill.id, payload.number_of_questions)
    assessment = Assessment(user_id=current_user.id, title=f"{skill.name} AI Assessment", assessment_type="ai_generated", total_questions=len(generated), total_score=len(generated))
    db.add(assessment)
    try:
        db.flush()
        questions = []
        for item in generated:
            options = item.options
            correct_option = "ABCD"[options.index(item.correct_answer)]
            question = AssessmentQuestion(assessment_id=assessment.id, question_text=item.question, option_a=options[0], option_b=options[1], option_c=options[2], option_d=options[3], correct_option=correct_option, explanation=item.explanation, skill_id=skill.id)
            db.add(question); questions.append(question)
        db.commit()
        for question in questions: db.refresh(question)
        db.refresh(assessment)
    except Exception:
        db.rollback()
        raise
    return _response(assessment, questions)


@router.get("/{assessment_id}", response_model=AssessmentResponse)
def get_assessment(assessment_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> AssessmentResponse:
    assessment = _owned_assessment(assessment_id, current_user.id, db)
    questions = list(db.scalars(select(AssessmentQuestion).where(AssessmentQuestion.assessment_id == assessment.id).order_by(AssessmentQuestion.id)))
    return _response(assessment, questions)


@router.post("/{assessment_id}/submit", response_model=AssessmentResultResponse)
def submit_assessment(assessment_id: int, payload: SubmitAssessmentRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> AssessmentResultResponse:
    assessment = _owned_assessment(assessment_id, current_user.id, db)
    if assessment.completed_at is not None or db.scalar(select(AssessmentResult.id).where(AssessmentResult.assessment_id == assessment.id, AssessmentResult.user_id == current_user.id)) is not None:
        raise HTTPException(status_code=409, detail="Assessment has already been submitted")
    questions = list(db.scalars(select(AssessmentQuestion).where(AssessmentQuestion.assessment_id == assessment.id)))
    answers = {answer.question_id: answer.selected_answer for answer in payload.answers}
    if len(answers) != len(payload.answers) or set(answers) != {question.id for question in questions}:
        raise HTTPException(status_code=422, detail="Submit exactly one answer for every assessment question")
    score = 0
    for question in questions:
        options = [question.option_a, question.option_b, question.option_c, question.option_d]
        selected = answers[question.id]
        if selected not in options:
            raise HTTPException(status_code=422, detail="Submitted answer is not a question option")
        if selected == options["ABCD".index(question.correct_option)]: score += 1
    percentage = round(score / len(questions) * 100, 2) if questions else 0.0
    result = AssessmentResult(assessment_id=assessment.id, user_id=current_user.id, score=score, percentage=percentage, passed=percentage >= 60)
    db.add(result); assessment.completed_at = __import__('sqlalchemy').func.now()
    skill_ids = {question.skill_id for question in questions if question.skill_id is not None}
    if len(skill_ids) == 1:
        update_employee_skill_from_assessment(
            db, current_user.id, skill_ids.pop(), percentage
        )
    db.commit(); db.refresh(result)
    return AssessmentResultResponse(assessment_id=assessment.id, score=float(result.score), total_questions=len(questions), percentage=float(result.percentage), passed=result.passed)
