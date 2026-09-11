import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles } from 'lucide-react';
import { chatbotAPI } from '../components/services/api';
import MarkdownMessage from '../components/MarkdownMessage';

const suggestions = [
  'What courses do you recommend for full-stack engineering?',
  'Explain the critical skill gaps currently identified on my profile',
  'How do I prepare for advanced system architecture assessments?',
  'Recommend an accelerated learning path for frontend development'
];

const Assistant = () => {
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: 'Greetings. I am your SkillSync-AI learning assistant. I analyze your skill gaps, synthesize learning pathways, and provide conceptual breakdowns on demand. How can I guide your growth today?'
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textToSend) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMsg = { role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await chatbotAPI.sendMessage({ message: text });
      const botReply = res.data?.answer ||
        'I am continuously monitoring your competency milestones. Let me know what area you would like to explore next.';
      setMessages((prev) => [...prev, { role: 'bot', text: botReply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: 'I encountered an interruption while querying the AI reasoning model. Please try asking again in a moment.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in">
      <div
        className="card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 120px)',
          minHeight: 420,
          overflow: 'hidden',
          border: '1px solid var(--border-gold)',
          boxShadow: 'var(--shadow-xl)'
        }}
      >
        {/* ASSISTANT HEADER */}
        <div style={{
          background: 'linear-gradient(135deg, #16362a 0%, #10271e 100%)',
          padding: '1.25rem 1.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          width: '100%',
          boxSizing: 'border-box',
          flexShrink: 0,
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: 'rgba(212, 178, 111, 0.18)',
            border: '1px solid var(--border-gold)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-gold)'
          }}>
            <Bot size={22} />
          </div>
          <div className="assistant-header-title" style={{
            fontWeight: 700,
            fontSize: '1.0625rem',
            fontFamily: 'var(--font-serif)'
          }}>
            AI Assistant
          </div>
        </div>

        {/* CONVERSATION AREA */}
        <div style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          padding: '1.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          background: 'var(--bg-primary)'
        }}>
          {messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={idx}
                style={{
                  maxWidth: '78%',
                  padding: '0.875rem 1.25rem',
                  borderRadius: 'var(--radius-xl)',
                  fontSize: '0.90625rem',
                  lineHeight: 1.65,
                  alignSelf: isUser ? 'flex-end' : 'flex-start',
                  background: isUser
                    ? 'linear-gradient(135deg, #dfb76c 0%, #c49d52 100%)'
                    : 'var(--bg-surface-elevated)',
                  color: isUser ? '#0c1c16' : 'var(--text-primary)',
                  fontWeight: isUser ? 600 : 400,
                  border: isUser ? 'none' : '1px solid var(--border-subtle)',
                  borderBottomRightRadius: isUser ? 'var(--radius-xs)' : 'var(--radius-xl)',
                  borderBottomLeftRadius: isUser ? 'var(--radius-xl)' : 'var(--radius-xs)',
                  boxShadow: isUser ? '0 4px 14px rgba(212, 178, 111, 0.2)' : 'var(--shadow-sm)'
                }}
              >
                {isUser ? msg.text : <MarkdownMessage content={msg.text} />}
              </div>
            );
          })}

          {loading && (
            <div style={{
              alignSelf: 'flex-start',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xl)',
              borderBottomLeftRadius: 'var(--radius-xs)',
              padding: '0.75rem 1.25rem',
              fontSize: '0.875rem',
              color: 'var(--accent-gold)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem'
            }}>
              <Sparkles size={16} className="animate-spin" />
              <span>Analyzing curriculum telemetry...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* SUGGESTED PROMPTS */}
        {messages.length <= 2 && (
          <div style={{
            padding: '0.625rem 1.5rem',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            background: 'var(--bg-surface)',
            borderTop: '1px solid var(--border-subtle)'
          }}>
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                className="btn btn-sm btn-outline"
                onClick={() => handleSend(s)}
                style={{ fontSize: '0.75rem', padding: '0.3125rem 0.6875rem' }}
              >
                <Sparkles size={12} style={{ color: 'var(--accent-gold)' }} />
                <span>{s}</span>
              </button>
            ))}
          </div>
        )}

        {/* INPUT COMPOSER */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          gap: '0.75rem',
          background: 'var(--bg-surface)'
        }}>
          <input
            className="form-input"
            placeholder="Ask about skill gaps, courses, study strategies..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={loading}
          />
          <button
            className="btn btn-primary"
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Assistant);
