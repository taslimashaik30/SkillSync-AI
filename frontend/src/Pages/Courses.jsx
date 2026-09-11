import React, { useState, useEffect } from 'react';
import { Search, Filter, BookOpen, Clock, BarChart3, ArrowRight, Compass } from 'lucide-react';
import CourseCard from '../components/CourseCard';
import { coursesAPI } from '../components/services/api';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [level, setLevel] = useState('all');

  useEffect(() => {
    let mounted = true;
    const fetchCourses = async () => {
      try {
        const response = await coursesAPI.getAll();
        if (mounted) setCourses(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        if (mounted) setError(err.response?.data?.detail || 'Unable to load courses catalog.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchCourses();
    return () => { mounted = false; };
  }, []);

  const categories = ['all', ...new Set(courses.map((c) => c.category || c.domain || 'General'))];
  const levels = ['all', ...new Set(courses.map((c) => c.level || 'All Levels'))];

  const filtered = courses.filter((c) => {
    const titleMatch = (c.title || c.name || '').toLowerCase().includes(search.toLowerCase());
    const descMatch = (c.description || '').toLowerCase().includes(search.toLowerCase());
    const matchesSearch = titleMatch || descMatch;
    const matchesCategory = category === 'all' || (c.category || c.domain || 'General') === category;
    const matchesLevel = level === 'all' || (c.level || 'All Levels') === level;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner" />
        <p>Curating course catalog...</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Course Catalog</h1>
        <p className="page-subtitle">Explore courses built for your growth and aligned with your skill roadmap.</p>
      </div>

      {error && (
        <div className="error-state" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
          <div className="error-state-title">{error}</div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.84375rem' }}>
            Could not fetch courses from backend API. Please retry.
          </p>
          <button className="btn btn-primary btn-sm mt-4" onClick={() => window.location.reload()}>
            Retry Connection
          </button>
        </div>
      )}

      {/* SEARCH AND FILTERS BAR */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <div style={{
          position: 'relative',
          flex: 1,
          minWidth: 260
        }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--accent-gold)',
              pointerEvents: 'none'
            }}
          />
          <input
            className="form-input"
            style={{ paddingLeft: 42 }}
            placeholder="Search by topic, skill, or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <select
            className="form-input"
            style={{ width: 'auto', minWidth: 160 }}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c} value={c} style={{ background: 'var(--bg-surface)' }}>
                {c === 'all' ? 'All Domains' : c}
              </option>
            ))}
          </select>

          <select
            className="form-input"
            style={{ width: 'auto', minWidth: 150 }}
            value={level}
            onChange={(e) => setLevel(e.target.value)}
          >
            {levels.map((l) => (
              <option key={l} value={l} style={{ background: 'var(--bg-surface)' }}>
                {l === 'all' ? 'All Experience Levels' : l}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📚</div>
          <div className="empty-state-title">No matching courses discovered</div>
          <div className="empty-state-description">
            Adjust your search parameters or reset category filters to view full offerings.
          </div>
          {(search || category !== 'all' || level !== 'all') && (
            <button
              className="btn btn-outline btn-sm"
              style={{ marginTop: '1rem' }}
              onClick={() => { setSearch(''); setCategory('all'); setLevel('all'); }}
            >
              Clear All Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-3">
          {filtered.map((course, idx) => (
            <CourseCard key={idx} course={course} />
          ))}
        </div>
      )}
    </div>
  );
};

export default React.memo(Courses);
