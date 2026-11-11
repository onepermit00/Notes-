import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUp, MessageSquare, RefreshCw } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { authApi } from '../services/authApi';

/* One thread per property, shared by the manager and everyone on the desk. Messages are stored on the
   server, so a note left at 2 AM is waiting for the manager in the morning and for the next shift.
   The assistant posts here too ("tell the team the pool is closed until noon"). */
const POLL_MS = 12000;
const dayLabel = d => { const now = new Date(), y = new Date(now); y.setDate(now.getDate() - 1); return d.toDateString() === now.toDateString() ? 'Today' : d.toDateString() === y.toDateString() ? 'Yesterday' : d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }); };

export const TeamMessagesPage = ({ user, isPhone = false }) => {
  const { colors, isDarkMode } = useTheme();
  const { CARD, CARD2, BORDER, TEXT, MUTED, INTER, ACCENT } = colors;
  const [messages, setMessages] = useState([]);
  const [state, setState] = useState('loading'); // loading | ready | error
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const endRef = useRef(null);
  const count = useRef(0);
  const myName = user?.name || '';
  const myType = user?.user_type || '';

  const load = useCallback(async () => {
    try { const list = await authApi.getMessages(); setMessages(list); setState('ready'); }
    catch { setState(s => (s === 'ready' ? 'ready' : 'error')); }
  }, []);

  useEffect(() => { load(); const t = setInterval(load, POLL_MS); return () => clearInterval(t); }, [load]);
  useEffect(() => { if (messages.length !== count.current) { count.current = messages.length; endRef.current?.scrollIntoView({ block: 'end' }); } }, [messages]);

  const send = async e => {
    e?.preventDefault();
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true); setSendError('');
    try { const saved = await authApi.sendMessage(text); setMessages(m => [...m, saved]); setDraft(''); }
    catch { setSendError('That didn’t send. Check the connection and try again.'); }
    finally { setSending(false); }
  };

  let lastDay = '';
  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', fontFamily: INTER }} data-testid="team-messages">
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: isPhone ? '16px 16px 8px' : '22px 30px 8px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {state === 'loading' && <p style={{ fontSize: 13, color: MUTED, margin: 'auto' }}>Loading messages…</p>}
        {state === 'error' && <div style={{ margin: 'auto', textAlign: 'center' }}>
          <p style={{ fontSize: 15, fontWeight: 800, color: TEXT, margin: '0 0 6px' }}>Messages couldn’t load</p>
          <p style={{ fontSize: 13, color: MUTED, margin: '0 0 14px' }}>Check the connection and try again.</p>
          <button type="button" onClick={load} style={{ minHeight: 40, padding: '0 16px', borderRadius: 999, border: `1px solid ${BORDER}`, background: CARD2, color: TEXT, fontFamily: INTER, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 7 }}><RefreshCw size={14} /> Try again</button>
        </div>}
        {state === 'ready' && !messages.length && <div style={{ margin: 'auto', textAlign: 'center', maxWidth: 340 }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: CARD2, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}><MessageSquare size={22} color={MUTED} /></div>
          <p style={{ fontSize: 17, fontWeight: 800, color: TEXT, letterSpacing: '-.02em', margin: '0 0 6px' }}>No messages yet</p>
          <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.6, margin: 0 }}>Notes between the manager and the desk appear here and stay on the property record.</p>
        </div>}
        {state === 'ready' && messages.map(m => {
          const at = m.created_at ? new Date(m.created_at) : null;
          const day = at ? dayLabel(at) : '';
          const showDay = day && day !== lastDay; lastDay = day || lastDay;
          const mine = m.sender_name === myName && (!myType || m.sender_type === myType);
          return <React.Fragment key={m.message_id}>
            {showDay && <div style={{ alignSelf: 'center', fontSize: 10, fontWeight: 800, color: MUTED, letterSpacing: '.14em', textTransform: 'uppercase', margin: '8px 0 2px' }}>{day}</div>}
            <div style={{ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '82%' }}>
              {!mine && <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, margin: '0 0 4px 4px' }}>{m.sender_name}{m.sender_type === 'manager' ? ' · Manager' : ''}</div>}
              <div style={{ background: mine ? (isDarkMode ? '#2A2A2A' : '#222222') : CARD, color: mine ? '#fff' : TEXT, border: mine ? 'none' : `1px solid ${BORDER}`, padding: '10px 15px', borderRadius: mine ? '18px 18px 6px 18px' : '18px 18px 18px 6px', fontSize: 14, lineHeight: 1.5, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{m.content}</div>
              {at && <div style={{ fontSize: 10.5, color: MUTED, margin: '4px 4px 0', textAlign: mine ? 'right' : 'left' }}>{at.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</div>}
            </div>
          </React.Fragment>;
        })}
        <div ref={endRef} />
      </div>
      {sendError && <p role="alert" style={{ fontSize: 12.5, color: colors.RED, margin: 0, padding: isPhone ? '0 16px 6px' : '0 30px 6px' }}>{sendError}</p>}
      <form onSubmit={send} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: isPhone ? '12px 16px 16px' : '14px 30px 22px', borderTop: `1px solid ${BORDER}`, background: CARD, flexShrink: 0 }}>
        <input value={draft} onChange={e => setDraft(e.target.value)} maxLength={1000} placeholder="Message the property team" aria-label="Message the property team" data-testid="team-message-input"
          style={{ flex: 1, minWidth: 0, height: 48, padding: '0 18px', borderRadius: 999, border: `1.5px solid ${BORDER}`, background: CARD2, color: TEXT, fontFamily: INTER, fontSize: 15, outline: 'none' }} />
        <button type="submit" aria-label="Send" disabled={!draft.trim() || sending} data-testid="team-message-send"
          style={{ width: 48, height: 48, borderRadius: 999, border: 'none', background: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: draft.trim() ? 'pointer' : 'default', opacity: !draft.trim() || sending ? 0.45 : 1, flexShrink: 0 }}><ArrowUp size={20} color="#fff" strokeWidth={2.4} /></button>
      </form>
    </div>
  );
};

export default TeamMessagesPage;
