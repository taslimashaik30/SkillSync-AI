import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, BookOpen, BarChart3, ArrowRight } from 'lucide-react';
import ProgressBar from './ProgressBar';

const CourseCard = ({ course }) => {
  if (!course) return null;

  const id = course.id || course.course_id || course._id;
  const title = course.title || course.name || course.course_title || 'Untitled Course';
  const description = course.description || course.summary || 'Build competencies and advance your learning pathway.';
  const duration = course.duration || course.estimated_time || 'Self-paced';
  const level = course.level || course.difficulty || 'All Levels';
  const category = course.category || course.domain || 'Learning Path';
  const progress = course.progress ?? course.completion_percentage ?? null;

  return (
    <article className="course-card card-hover">
      <div className="course-card-cover">
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem' }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: 'rgba(212, 178, 111, 0.15)',
            border: '1px solid var(--border-gold)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-gold)'
          }}>
            <BookOpen size={22} />
          </div>
          <span style={{ fontSize: '0.6875rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--accent-gold-light)', fontWeight: 600 }}>
            {category}
          </span>
        </div>
      </div>

      <div className="course-card-body">
        <h3 className="course-card-title">{title}</h3>
        <p className="course-card-description">{description}</p>

        {progress !== null && progress !== undefined && (
          <div style={{ marginBottom: '1rem' }}>
            <ProgressBar value={progress} showLabel height={6} />
          </div>
        )}

        <div className="course-card-footer">
          <div className="course-card-meta">
            <span title="Duration"><Clock size={13} /> {duration}</span>
            <span title="Level"><BarChart3 size={13} /> {level}</span>
          </div>
          <Link to={`/courses/${id}`} className="btn btn-sm btn-primary">
            <span>Explore</span> <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </article>
  );
};

export default React.memo(CourseCard);