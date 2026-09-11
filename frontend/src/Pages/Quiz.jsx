import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, RefreshCw, Award, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import QuizCard from '../components/QuizCard';
import { assessmentsAPI, skillsAPI } from '../components/services/api';

const Quiz = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [skills, setSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [material, setMaterial] = useState(null);
  const [assessmentId, setAssessmentId] = useState(null);

  const generateQuiz = async () => {
    setGenerating(true);
    setError('');
    setQuestions([]);
    setCurrent(0);
    setAnswers({});
    setSubmitted(false);
    setResult(null);

    if (!selectedSkill || !material) {
      setError('Select one of your skills and a PDF learning material to generate an assessment.');
      setGenerating(false);
      return;
    }
    try {
      const upload = await assessmentsAPI.uploadMaterial(material);
      const response = await assessmentsAPI.generate({
        skill_id: Number(selectedSkill),
        number_of_questions: 5,
        pdf_filename: upload.data.filename,
      });
      setAssessmentId(response.data.id);
      setQuestions(response.data.questions || []);
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to generate an assessment from this material.');
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    skillsAPI.getAll()
      .then((response) => { if (mounted) setSkills(response.data || []); })
      .catch((err) => { if (mounted) setError(err.response?.data?.detail || 'Unable to load your skills.'); });
    return () => { mounted = false; };
  }, []);

  const handleAnswer = (selectedAnswer) => {
    setAnswers((prev) => ({ ...prev, [questions[current].id]: selectedAnswer }));
  };

  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent(current + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!assessmentId || questions.some((question) => !answers[question.id])) {
      setError('Select an answer for every question before submitting.');
      return;
    }
    setLoading(true);
    try {
      const response = await assessmentsAPI.submit(assessmentId, {
        answers: questions.map((question) => ({ question_id: question.id, selected_answer: answers[question.id] })),
      });
      setResult(response.data);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to submit assessment.');
    } finally {
      setLoading(false);
    }
  };

  if (generating) {
    return (
      <div className="loading-state">
        <div className="spinner" />
        <p>Synthesizing adaptive competency evaluation questions...</p>
      </div>
    );
  }

  // RESULTS VIEW
  if (submitted && result) {
    const score = result.percentage ?? 0;
    const correct = result.score ?? 0;
    const total = result.total ?? result.total_questions ?? questions.length;
    const isPassing = score >= 60;

    return (
      <div className="fade-in">
        <div className="card" style={{ padding: '3.5rem 2rem', textAlign: 'center', maxWidth: 580, margin: '2rem auto' }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'rgba(212, 178, 111, 0.15)',
              border: '2px solid var(--border-gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              color: 'var(--accent-gold)'
            }}
          >
            <Award size={38} />
          </div>

          <span className="section-label">ASSESSMENT COMPLETE</span>
          <h1 style={{
            fontSize: '1.875rem',
            fontWeight: 700,
            color: 'var(--text-cream)',
            fontFamily: 'var(--font-serif)',
            margin: '0.5rem 0 1rem'
          }}>
            {isPassing ? 'Proficiency Verified!' : 'Assessment Concluded'}
          </h1>

          <div style={{
            fontSize: '3.75rem',
            fontWeight: 800,
            fontFamily: 'var(--font-serif)',
            color: score >= 70 ? 'var(--status-success)' : score >= 40 ? 'var(--accent-gold)' : 'var(--accent-terracotta)',
            lineHeight: 1,
            marginBottom: '0.875rem'
          }}>
            {Math.round(score)}%
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginBottom: '2rem' }}>
            You answered <strong style={{ color: 'var(--text-cream)' }}>{correct}</strong> out of{' '}
            <strong style={{ color: 'var(--text-cream)' }}>{total}</strong> questions correctly.
          </p>

          <div style={{ display: 'flex', gap: '0.875rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-outline" onClick={generateQuiz}>
              <RefreshCw size={15} /> Retake Assessment
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/skill-gap')}>
              <span>View Updated Skill Gaps</span> <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // EMPTY QUESTIONS STATE
  if (questions.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🧠</div>
        <div className="empty-state-title">Create an assessment</div>
        <div style={{ display: 'grid', gap: '0.75rem', maxWidth: 420, margin: '1rem auto', textAlign: 'left' }}>
          <select className="form-input" value={selectedSkill} onChange={(event) => setSelectedSkill(event.target.value)}>
            <option value="">Select one of your skills</option>
            {skills.map((skill) => <option key={skill.id} value={skill.id}>{skill.name}</option>)}
          </select>
          <input className="form-input" type="file" accept="application/pdf" onChange={(event) => setMaterial(event.target.files?.[0] || null)} />
        </div>
        {error && <div className="empty-state-description" style={{ color: 'var(--accent-terracotta)' }}>{error}</div>}
        <button className="btn btn-primary mt-4" onClick={generateQuiz}>
          <RefreshCw size={16} /> Generate Questions
        </button>
      </div>
    );
  }

  const question = questions[current];
  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round(((current + 1) / questions.length) * 100);

  return (
    <div className="fade-in" style={{ maxWidth: 740, margin: '0 auto' }}>
      <div className="page-header" style={{ textAlign: 'center' }}>
        <h1 className="page-title">Competency Assessment</h1>
        <p className="page-subtitle">Demonstrate domain knowledge to refine your personalized skill gap telemetry.</p>
      </div>

      {/* QUESTION COUNTER & PROGRESS */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        background: 'var(--bg-surface)',
        padding: '0.875rem 1.25rem',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <Brain size={18} style={{ color: 'var(--accent-gold)' }} />
          <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-cream)' }}>
            Question {current + 1} of {questions.length}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <span style={{ fontSize: '0.78125rem', color: 'var(--text-muted)' }}>
            {answeredCount}/{questions.length} answered
          </span>
          <div className="progress-track" style={{ width: 110, height: 6 }}>
            <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>

      {/* QUIZ CARD */}
      <QuizCard key={question.id} question={question} index={current} onAnswer={handleAnswer} />

      {/* NAVIGATION CONTROLS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.75rem' }}>
        <button
          className="btn btn-outline"
          onClick={() => setCurrent(Math.max(0, current - 1))}
          disabled={current === 0}
        >
          Previous
        </button>

        <button
          className="btn btn-primary"
          onClick={handleNext}
          disabled={loading}
        >
          <span>{current < questions.length - 1 ? 'Next Question' : 'Submit Assessment'}</span>
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
};

export default React.memo(Quiz);
