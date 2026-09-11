import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, MessageCircle, Sparkles } from 'lucide-react';
import { chatbotAPI } from './services/api';
import MarkdownMessage from './MarkdownMessage';

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Greetings! I am your SkillSync-AI learning assistant. How can I assist with your courses, skill gaps, or learning paths today?' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', text: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await chatbotAPI.sendMessage({ message: userMsg.text });
      const botReply = res.data?.answer || 'I am here to guide your learning journey.';
      setMessages((prev) => [...prev, { role: 'bot', text: botReply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: 'I encountered an issue connecting with the learning model. Please try again shortly.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot-widget">
      {open && (
        <div className="chatbot-panel" role="dialog" aria-label="AI Learning Assistant">
          <div className="chatbot-header">
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'rgba(212, 178, 111, 0.2)',
              border: '1px solid var(--border-gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-gold)'
            }}>
              <Bot size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <div className="chatbot-header-title">SkillSync-AI Assistant</div>
              <div className="chatbot-header-subtitle">Intelligent Learning Guide</div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{
                color: 'var(--text-muted)',
                padding: '0.25rem',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              aria-label="Close Assistant"
            >
              <X size={18} />
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`chat-message ${msg.role === 'user' ? 'chat-message-user' : 'chat-message-bot'}`}
              >
                {msg.role === 'user' ? msg.text : <MarkdownMessage content={msg.text} />}
              </div>
            ))}
            {loading && (
              <div className="chat-message chat-message-bot" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-gold)' }}>
                <Sparkles size={14} className="animate-spin" /> Analyzing response...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-input">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about skills, paths, courses..."
              aria-label="Ask a question"
            />
            <button
              className="chatbot-send"
              onClick={handleSend}
              disabled={loading || !input.trim()}
              aria-label="Send message"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}

      <button
        className="chatbot-toggle"
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Close AI Assistant' : 'Open AI Assistant'}
        title="SkillSync-AI Assistant"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </div>
  );
};

export default React.memo(Chatbot);
