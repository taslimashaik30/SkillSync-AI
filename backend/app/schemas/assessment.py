from pydantic import BaseModel, Field

class GenerateAssessmentRequest(BaseModel):
    skill_id: int = Field(gt=0)
    number_of_questions: int = Field(ge=1, le=10)
    pdf_filename: str = Field(min_length=1, max_length=255)
class AssessmentQuestionResponse(BaseModel):
    id: int
    question: str
    options: list[str]
class AssessmentResponse(BaseModel):
    id: int
    title: str
    total_questions: int
    questions: list[AssessmentQuestionResponse]
class AnswerSubmission(BaseModel):
    question_id: int
    selected_answer: str = Field(min_length=1)
class SubmitAssessmentRequest(BaseModel):
    answers: list[AnswerSubmission] = Field(min_length=1)
class AssessmentResultResponse(BaseModel):
    assessment_id: int
    score: float
    total_questions: int
    percentage: float
    passed: bool
class UploadMaterialResponse(BaseModel):
    filename: str
    message: str
