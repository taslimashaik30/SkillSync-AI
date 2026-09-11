import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Target, Clock, Award, Compass } from 'lucide-react';
import { recommendationsAPI } from '../components/services/api';

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const fetchRecs = async () => {
      try {
        const res = await recommendationsAPI.getAll();
        if (!mounted) return;
        const list = res.data?.recommendations || res.data || [];
        setRecommendations(Array.isArray(list) ? list : []);
      } catch (err) {
        if (mounted) setError(err.response?.data?.detail || 'Unable to compute AI recommendations.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchRecs();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner" />
        <p>Synthesizing intelligent course recommendations...</p>
      </div>
    );
  }

  const sorted = [...recommendations].sort(
    (a, b) => (b.recommendation_score ?? 0) - (a.recommendation_score ?? 0)
  );

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">AI Course Recommendations</h1>
        <p className="page-subtitle">Algorithmic course discovery matching your specific competency gaps and targeted growth goals.</p>
      </div>

      {error && (
        <div className="error-state" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
          <div className="error-state-title">{error}</div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.84375rem' }}>
            Recommendation engine connection interrupted.
          </p>
        </div>
      )}

      {sorted.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">✨</div>
          <div className="empty-state-title">No AI recommendations currently matched</div>
          <div className="empty-state-description">
            Complete your skill gap analysis or browse the catalog to train the recommendation engine.
          </div>
          <Link to="/skill-gap" className="btn btn-primary mt-4">
            <span>View Skill Gaps</span> <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-2">
          {sorted.map((rec, idx) => {
            const score = rec.recommendation_score ?? 0;
            const reason = rec.reason;
            const title = rec.resource_title;
            const category = rec.resource_type || rec.skill_name;

            return (
              <div key={idx} className="recommendation-card card-hover">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                    <div className="stat-icon stat-icon-primary" style={{ width: 44, height: 44 }}>
                      <Sparkles size={20} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-cream)' }}>
                        {title}
                      </h3>
                      <div style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 600 }}>
                        {category}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div className="recommendation-score">{Math.round(score)}%</div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                      Match Score
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: '0.84375rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.65 }}>
                  {reason}
                </p>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                  <span className="badge badge-warning" style={{ fontSize: '0.71875rem' }}><Target size={12} /> {rec.skill_name}</span>
                  <span className="badge badge-info" style={{ fontSize: '0.71875rem' }}><Clock size={12} /> Gap: {rec.gap_level}</span>
                  <span className="badge badge-success" style={{ fontSize: '0.71875rem' }}><Award size={12} /> Target: {rec.required_level} / 5</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default React.memo(Recommendations);
