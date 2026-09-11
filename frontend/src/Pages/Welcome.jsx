import React from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap, Target, Sparkles, BookOpen, Clock,
  CheckCircle2, ArrowRight, Brain, BarChart3, Bot, Compass,
  Layers, ChevronRight
} from 'lucide-react';
import BotanicalBackground from '../components/BotanicalBackground';

const featuresList = [
  {
    icon: Compass,
    title: 'Personalized Learning',
    description: 'Tailored curriculum aligned with individual career objectives, prior experience, and unique learning pace.'
  },
  {
    icon: Target,
    title: 'Skill Gap Analysis',
    description: 'Pinpoint precise discrepancies between your current competencies and aspirational target roles.'
  },
  {
    icon: Sparkles,
    title: 'AI Course Recommendations',
    description: 'Context-aware course discovery powered by machine intelligence to maximize skill acquisition efficiency.'
  },
  {
    icon: Layers,
    title: 'Personalized Learning Paths',
    description: 'Structured step-by-step roadmaps that transform broad learning goals into measurable daily momentum.'
  },
  {
    icon: BarChart3,
    title: 'Progress Tracking',
    description: 'Comprehensive momentum analytics, milestone monitoring, and quantifiable competency metrics.'
  },
  {
    icon: CheckCircle2,
    title: 'Quizzes & Assessments',
    description: 'Adaptive diagnostic assessments designed to evaluate and reinforce real-world domain mastery.'
  },
  {
    icon: Brain,
    title: 'Career & Skill Insights',
    description: 'Strategic market demand alignment connecting acquired skill sets directly to industry progression.'
  },
  {
    icon: Bot,
    title: 'AI Learning Assistant',
    description: 'Always-available intelligent copilot offering contextual answers, explanation, and study guidance.'
  }
];

const featuredCoursesList = [
  {
    category: 'Development',
    title: 'Frontend Development',
    description: 'Build modern, accessible, and responsive user interfaces with HTML5, modern CSS architectures, and React.',
    level: 'Beginner → Intermediate',
    abstractType: 'frontend'
  },
  {
    category: 'Programming',
    title: 'Python Programming',
    description: 'Master core algorithmic thinking, object-oriented design, and robust scripting using standard Python.',
    level: 'Beginner',
    abstractType: 'python'
  },
  {
    category: 'Data & Analytics',
    title: 'Data Science & Analytics',
    description: 'Extract actionable intelligence from complex datasets utilizing statistical modeling and visual exploration.',
    level: 'Intermediate',
    abstractType: 'data'
  },
  {
    category: 'AI & ML',
    title: 'Artificial Intelligence',
    description: 'Explore foundational deep learning principles, transformer architectures, and intelligent cognitive systems.',
    level: 'Intermediate',
    abstractType: 'ai'
  },
  {
    category: 'Design',
    title: 'UI/UX Design',
    description: 'Craft intuitive, user-centered digital products through research, wireframing, and design systems.',
    level: 'Beginner → Intermediate',
    abstractType: 'design'
  },
  {
    category: 'Full Stack',
    title: 'Full Stack Development',
    description: 'Architect complete end-to-end applications bridging database systems, API layers, and reactive frontends.',
    level: 'Intermediate → Advanced',
    abstractType: 'fullstack'
  }
];

const Welcome = () => {
  return (
    <div className="landing-page">
      <BotanicalBackground variant="welcome" />

      {/* NAVBAR */}
      <header className="landing-nav">
        <div className="landing-nav-inner">
          <Link to="/" className="landing-brand" aria-label="SkillSync-AI Home">
            <div className="landing-brand-mark">
              <GraduationCap size={20} />
            </div>
            <span>
              SkillSync<span style={{ color: 'var(--accent-gold)' }}>-AI</span>
            </span>
          </Link>

          <nav className="landing-nav-links" aria-label="Main navigation">
            <a href="#features" className="landing-nav-link">Features</a>
            <a href="#about" className="landing-nav-link">About</a>
            <Link to="/login" className="landing-nav-link">Login</Link>
            <Link to="/register" className="landing-nav-cta">Sign Up</Link>
          </nav>
        </div>
      </header>

      <main>
        {/* HERO SECTION */}
        <section className="landing-hero">
          <div className="landing-hero-copy">
            <div className="landing-badge">
              <Sparkles size={13} style={{ color: 'var(--accent-gold)' }} />
              <span>AI-POWERED LEARNING PLATFORM</span>
            </div>

            <h1 className="landing-hero-title">
              Learn Today.
              <br />
              <span>Lead Tomorrow.</span>
            </h1>

            <p className="landing-hero-description">
              SkillSync-AI helps learners grow with AI-powered personalized learning,
              skill-gap analysis, course recommendations, guided learning paths and
              measurable progress.
            </p>

            <div className="landing-hero-actions">
              <Link to="/register" className="btn btn-primary btn-lg">
                <span>Start Learning</span>
                <ArrowRight size={16} />
              </Link>

              <Link to="/login" className="btn btn-outline btn-lg">
                <span>I already have an account</span>
              </Link>
            </div>
          </div>

          {/* RIGHT-SIDE HERO PRODUCT VISUAL: Pure CSS/HTML */}
          <div className="hero-product-preview" aria-label="SkillSync-AI Product Interface Preview">
            <img
              src="https://thisisanitsupportgroup.com/blog-images/study-it-certifications-while-working-2026.jpg"
              alt="SkillSync visual"
              style={{
                height: 'auto',
                maxHeight: 1150,
                objectFit: 'contain',
                display: 'block',
                margin: '0 auto',
                borderRadius: '14px',
                boxShadow: '0 26px 60px rgba(18, 4, 12, 0.55)'
              }}
            />
          </div>
        </section>

        {/* PAGE 2 — FEATURES SECTION */}
        <section id="features" className="landing-section">
          <div className="section-heading-center">
            <span className="section-label">PLATFORM CAPABILITIES</span>
            <h2>Designed for Purposeful Competency Growth</h2>
            <p>
              Every tool within SkillSync-AI is engineered to diagnose, guide, and accelerate
              your journey from foundational learning to demonstrated leadership.
            </p>
          </div>

          <div className="grid grid-4">
            {featuresList.map((item, idx) => (
              <article key={idx} className="feature-card">
                <div className="feature-card-icon">
                  <item.icon size={22} />
                </div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* PAGE 3 — FEATURED COURSES (Placed AFTER Features) */}
        <section id="featured-courses" className="landing-section">
          <div className="section-heading-center">
            <span className="section-label">CURATED CURRICULUM</span>
            <h2>Explore courses built for your growth.</h2>
            <p>
              Build in-demand skills with focused courses designed to move you closer to your goals.
            </p>
          </div>

          <div className="grid grid-3">
            {featuredCoursesList.map((course, idx) => (
              <article key={idx} className="course-card card-hover">
                <div className="course-card-cover">
                  <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                    <div style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: 'rgba(212, 178, 111, 0.15)',
                      border: '1px solid var(--border-gold)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent-gold)',
                      marginBottom: '0.375rem'
                    }}>
                      <BookOpen size={20} />
                    </div>
                    <div style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-gold-light)' }}>
                      {course.category}
                    </div>
                  </div>
                </div>

                <div className="course-card-body">
                  <h3 className="course-card-title">{course.title}</h3>
                  <p className="course-card-description">{course.description}</p>

                  <div className="course-card-footer">
                    <span className="course-card-meta">
                      <Clock size={13} /> {course.level}
                    </span>
                    <Link to="/courses" className="btn btn-sm btn-ghost" style={{ padding: 0 }}>
                      <span style={{ fontWeight: 600 }}>Explore Course</span>
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* PAGE 4 — ABOUT SECTION */}
        <section id="about" className="landing-section">
          <div className="about-panel">
            <div>
              <span className="section-label">THE SKILLSYNC METHODOLOGY</span>
              <h2 style={{ fontSize: 'clamp(1.75rem, 2.5vw, 2.35rem)', lineHeight: 1.2, margin: '0.75rem 0 1.25rem' }}>
                Connecting Skills to Career Direction
              </h2>
              <p style={{ lineHeight: 1.8, fontSize: '0.95rem' }}>
                SkillSync-AI fundamentally redefines professional learning by connecting
                <strong> skills</strong>, <strong>learning</strong>, <strong>progress</strong>,
                <strong> AI recommendations</strong>, and <strong>career direction</strong> into
                a single unified continuum.
              </p>
            </div>

            <div style={{
              background: 'rgba(9, 23, 18, 0.65)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xl)',
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent-gold)' }} />
                <span style={{ fontSize: '0.875rem', color: 'var(--accent-gold-light)' }}>Objective skill proficiency benchmarks</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent-terracotta)' }} />
                <span style={{ fontSize: '0.875rem', color: 'var(--accent-gold-light)' }}>Algorithmic gap remediation roadmaps</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--status-success)' }} />
                <span style={{ fontSize: '0.875rem', color: 'var(--accent-gold-light)' }}>Validated assessments and verified competencies</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--status-info)' }} />
                <span style={{ fontSize: '0.875rem', color: 'var(--accent-gold-light)' }}>Continuous real-time AI learning assistance</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* PAGE 5 — FOOTER */}
      <footer className="landing-footer">
          <div className="landing-footer-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontFamily: 'var(--font-serif)', color: 'var(--accent-gold-light)' }}>
            <GraduationCap size={18} style={{ color: 'var(--accent-gold)' }} />
            <span>SkillSync-AI</span>
          </div>

          <div style={{ fontStyle: 'italic', color: 'var(--accent-gold-light)', fontFamily: 'var(--font-serif)' }}>
            Learn. Grow. Lead.
          </div>

          <div>
            © 2026 SkillSync-AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default React.memo(Welcome);
