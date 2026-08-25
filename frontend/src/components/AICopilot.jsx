import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Loader2, Heart, ClipboardList, ShieldCheck } from 'lucide-react';
import { CareAssistantIcon } from './CareAssistantIcon';
import { sendChatMessage, getGreeting } from '../services/geminiService';
import { useTheme } from '../context/ThemeContext';

const GREEN  = '#2E9E5B';
const BLUE   = '#FF385C';

export const AICopilot = ({ isOpen, onClose, role = 'caregiver', patientName = 'the patient' }) => {
  const { colors } = useTheme();
  const { BG, CARD, MUTED, BORDER, SHADOW, INTER } = colors;

  const glassCard = {
    background: CARD,
    border: `1px solid ${BORDER}`,
    boxShadow: SHADOW,
    borderRadius: 16,
  };

  const [messages, setMessages]     = useState([]);
  const [input, setInput]           = useState('');
  const [isLoading, setIsLoading]   = useState(false);
  const [isFocused, setIsFocused]   = useState(false);
  const [showIntro, setShowIntro]   = useState(true);
  const messagesEndRef              = useRef(null);
  const inputRef                    = useRef(null);
  const sessionId                   = useRef(`session-${Date.now()}`);

  useEffect(() => {
    if (isOpen && !showIntro && messages.length === 0) {
      const greeting = getGreeting(role, patientName);
      setMessages([{ role: 'assistant', content: greeting }]);
    }
  }, [isOpen, showIntro, role, patientName, messages.length]);

  useEffect(() => {
    setMessages([]);
    setShowIntro(true);
    sessionId.current = `session-${Date.now()}`;
  }, [role]);

  useEffect(() => {
    if (isOpen) {
      setShowIntro(true);
      document.body.style.overflow = 'hidden';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleContinue = () => setShowIntro(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    try {
      const response = await sendChatMessage(sessionId.current, userMessage, role, { patientName });
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const features = role === 'caregiver' ? [
    { icon: Heart,         title: 'Smart Care Guidance',        description: 'Get real-time recommendations on ADL tasks, vitals monitoring, and best care practices for your patient.' },
    { icon: ClipboardList, title: 'Task & Documentation Help',  description: 'AI can help you stay organized with shift notes, incident reports, and care plan documentation.' },
    { icon: ShieldCheck,   title: 'Safety & Compliance',        description: 'Get quick answers on medication protocols, emergency procedures, and compliance requirements.' },
  ] : [
    { icon: Heart,         title: 'Care Updates & Insights',    description: "Get summaries of your loved one's daily care, vitals trends, and caregiver activity at a glance." },
    { icon: ClipboardList, title: 'Ask Anything',               description: 'Have questions about medications, care plans, or daily routines? Your AI assistant has the answers.' },
    { icon: ShieldCheck,   title: 'Peace of Mind',              description: "Stay informed about your loved one's wellbeing with intelligent alerts and proactive health insights." },
  ];

  // ── Intro screen ────────────────────────────────────────────────────────────
  if (showIntro) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 100, fontFamily: INTER }}>
        <div style={{ position: 'fixed', inset: 0, background: BG, display: 'flex', flexDirection: 'column' }}>
          {/* Close */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '20px 20px 0' }}>
            <button onClick={onClose} data-testid="copilot-intro-close" style={{ width: 40, height: 40, background: CARD, border: `1px solid ${BORDER}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: SHADOW }}>
              <X size={18} color={MUTED} />
            </button>
          </div>

          {/* Scrollable */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
            {/* Icon */}
            <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 28 }}>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', inset: -16, borderRadius: '50%', background: `${BLUE}18`, filter: 'blur(24px)' }} />
                <CareAssistantIcon size={120} />
              </div>
            </div>

            {/* Title */}
            <h1 style={{ fontFamily: INTER, fontSize: '1.6rem', fontWeight: 700, color: colors.TEXT, textAlign: 'center', letterSpacing: '-0.01em', lineHeight: 1.2, marginBottom: 32 }}>
              Concierge AI Assistant
            </h1>

            {/* Features */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {features.map((f, i) => (
                <div key={i} data-testid={`copilot-feature-${i}`} style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  <div style={{ width: 48, height: 48, ...glassCard, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <f.icon size={22} color={BLUE} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: colors.TEXT, marginBottom: 4 }}>{f.title}</h3>
                    <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.6 }}>{f.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <div style={{ padding: '16px 28px 32px' }}>
            <p style={{ fontSize: 12, color: 'rgba(0,0,0,0.3)', textAlign: 'center', lineHeight: 1.6, marginBottom: 16 }}>
              This AI assistant provides concierge guidance based on Greystar and building protocols. For emergencies, always call 911 first.
            </p>
            <button
              onClick={handleContinue}
              data-testid="copilot-continue-btn"
              style={{ width: '100%', padding: '16px 0', background: BLUE, border: 'none', borderRadius: 14, fontFamily: INTER, fontSize: 16, fontWeight: 700, color: 'white', cursor: 'pointer', boxShadow: `0 8px 24px ${BLUE}30` }}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Chat screen ─────────────────────────────────────────────────────────────
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, fontFamily: INTER }}>
      <div style={{ position: 'fixed', inset: 0, background: BG, display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: `1px solid ${BORDER}`, background: CARD, boxShadow: SHADOW }}>
          <button onClick={onClose} data-testid="copilot-close" style={{ background: 'none', border: 'none', cursor: 'pointer', color: MUTED, display: 'flex' }}>
            <X size={22} />
          </button>
          <CareAssistantIcon size={38} />
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: colors.TEXT, lineHeight: 1.2 }}>Care Assistant</h2>
            <p style={{ fontSize: 11, color: MUTED, fontWeight: 600 }}>Powered by AI</p>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
              {msg.role === 'assistant' && (
                <div style={{ flexShrink: 0 }}>
                  <CareAssistantIcon size={30} />
                </div>
              )}
              <div style={{
                maxWidth: '85%',
                padding: '12px 16px',
                borderRadius: msg.role === 'user' ? '20px 20px 6px 20px' : '20px 20px 20px 6px',
                ...(msg.role === 'user'
                  ? { background: BLUE, boxShadow: `0 4px 16px ${BLUE}40` }
                  : { ...glassCard })
              }}>
                <p style={{ fontSize: 14, color: msg.role === 'user' ? 'white' : colors.TEXT, lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>{msg.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ flexShrink: 0 }}><CareAssistantIcon size={30} /></div>
              <div style={{ ...glassCard, padding: '12px 16px' }}>
                <Loader2 size={18} color={BLUE} style={{ animation: 'spin 1s linear infinite' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{ padding: '12px 16px 20px', borderTop: `1px solid ${BORDER}`, background: CARD }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Ask about care..."
              data-testid="copilot-input"
              style={{ flex: 1, padding: '12px 16px', background: colors.CARD2, border: `1.5px solid ${isFocused ? BLUE : BORDER}`, borderRadius: 12, color: colors.TEXT, fontFamily: INTER, fontSize: 15, outline: 'none', transition: 'border-color 200ms' }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              data-testid="copilot-send"
              style={{ width: 46, height: 46, background: (input.trim() && !isLoading) ? BLUE : colors.CARD2, border: `1px solid ${BORDER}`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: (input.trim() && !isLoading) ? 'pointer' : 'not-allowed', flexShrink: 0, transition: 'background 200ms', opacity: (!input.trim() || isLoading) ? 0.5 : 1 }}
            >
              <Send size={18} color={(input.trim() && !isLoading) ? 'white' : MUTED} />
            </button>
          </div>
          <p style={{ fontSize: 11, color: 'rgba(0,0,0,0.25)', textAlign: 'center', marginTop: 8 }}>
            Concierge guidance · For emergencies call 911
          </p>
        </div>
      </div>
    </div>
  );
};

export default AICopilot;
