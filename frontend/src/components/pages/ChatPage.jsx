import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Search, Users, Image, CheckCheck } from 'lucide-react';
import { UserRole } from '../../types';
import { useTheme } from '../../context/ThemeContext';

export const ChatPage = ({ role }) => {
  const { colors } = useTheme();
  const { BG, CARD, MUTED, BORDER, SHADOW, TEXT, INTER } = colors;

  const [activeConversation, setActiveConversation] = useState(null);
  const [message, setMessage] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const [conversationMessages, setConversationMessages] = useState({});
  const [searchText, setSearchText] = useState('');
  const messagesEndRef = useRef(null);

  const isCaregiver = role === UserRole.CAREGIVER;
  const accentColor = isCaregiver ? '#2E9E5B' : '#3A7BD5';

  const conversations = isCaregiver ? [
    { id: 'poa',        name: 'Mary Smith',        role: 'POA',               avatar: 'https://randomuser.me/api/portraits/women/44.jpg', lastMessage: 'Thank you for the update!',    time: '2:30 PM',   unread: 0, online: true,  isGroup: false },
    { id: 'supervisor', name: 'Sarah Johnson',      role: 'Supervisor',        avatar: 'https://randomuser.me/api/portraits/women/65.jpg', lastMessage: 'Please submit your timesheet',  time: '1:15 PM',   unread: 1, online: true,  isGroup: false },
    { id: 'weekend',    name: 'Michael Chen',       role: 'Weekend Caregiver', avatar: 'https://randomuser.me/api/portraits/men/32.jpg',   lastMessage: 'Handoff notes are ready',      time: 'Yesterday', unread: 0, online: false, isGroup: false },
    { id: 'team',       name: 'Care Team Handoff',  role: '',                  avatar: null,                                               lastMessage: 'Weekend schedule updated',     time: 'Yesterday', unread: 2, online: false, isGroup: true  },
  ] : [
    { id: 'family',    name: 'Family Group',   role: '',          avatar: null,                                               lastMessage: 'Can someone cover Sunday?',   time: '10:30 AM',  unread: 3, online: false, isGroup: true  },
    { id: 'caregiver', name: 'Julia Martinez', role: 'Caregiver', avatar: 'https://randomuser.me/api/portraits/women/68.jpg', lastMessage: 'David had a great morning!',  time: '9:32 AM',   unread: 0, online: true,  isGroup: false },
    { id: 'tom',       name: 'Tom Smith',      role: 'Brother',   avatar: 'https://randomuser.me/api/portraits/men/75.jpg',   lastMessage: "I'll bring the puzzle",       time: 'Yesterday', unread: 0, online: false, isGroup: false },
  ];

  const getInitialMessages = () => [
    { id: 1, sender: 'other', text: 'Hi! How is everything going with Dad today?',                                           time: '9:30 AM', status: 'read' },
    { id: 2, sender: 'me',    text: 'Great! He had a wonderful breakfast and we just finished his morning walk.',             time: '9:32 AM', status: 'read' },
    { id: 3, sender: 'other', text: "That's wonderful to hear! Did he take his medication?",                                  time: '9:33 AM', status: 'read' },
    { id: 4, sender: 'me',    text: "Yes, all medications given on time. I've uploaded the photo evidence.", hasImage: true,  time: '9:35 AM', status: 'read' },
    { id: 5, sender: 'other', text: 'Thank you for the update!',                                                              time: '9:36 AM', status: 'read' },
  ];

  useEffect(() => {
    if (activeConversation && !conversationMessages[activeConversation]) {
      setConversationMessages(prev => ({ ...prev, [activeConversation]: getInitialMessages() }));
    }
  }, [activeConversation, conversationMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationMessages, activeConversation]);

  const getCurrentTime = () =>
    new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  const handleSend = () => {
    if (!message.trim() || !activeConversation) return;
    const newMsg = { id: Date.now(), sender: 'me', text: message.trim(), time: getCurrentTime(), status: 'read' };
    setConversationMessages(prev => ({ ...prev, [activeConversation]: [...(prev[activeConversation] || []), newMsg] }));
    setMessage('');
  };

  const filteredConversations = searchText
    ? conversations.filter(c => c.name.toLowerCase().includes(searchText.toLowerCase()))
    : conversations;

  // ── Chat view ──────────────────────────────────────────────────────────────
  if (activeConversation) {
    const conv = conversations.find(c => c.id === activeConversation);
    const msgs  = conversationMessages[activeConversation] || [];
    const displayName = conv?.role ? `${conv.name} (${conv.role})` : conv?.name;

    return (
      <div data-testid="chat-view" style={{ display: 'flex', flexDirection: 'column', height: '100%', background: BG, fontFamily: INTER }}>
        {/* Chat header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderBottom: `1px solid ${BORDER}`, background: CARD, boxShadow: SHADOW }}>
          <button onClick={() => setActiveConversation(null)} data-testid="chat-back-btn" style={{ background: 'none', border: 'none', cursor: 'pointer', color: MUTED, display: 'flex' }}>
            <ArrowLeft size={22} />
          </button>
          {conv?.isGroup ? (
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={22} color="white" />
            </div>
          ) : (
            <img src={conv?.avatar} alt={conv?.name} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} />
          )}
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: TEXT, lineHeight: 1.2 }}>{displayName}</p>
            {conv?.online && <p style={{ fontSize: 12, color: accentColor, marginTop: 2 }}>Online</p>}
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', paddingBottom: 120 }}>
          {msgs.map((msg) => (
            <div key={msg.id} style={{ marginBottom: 10, display: 'flex', justifyContent: msg.sender === 'me' ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '80%',
                padding: '12px 16px',
                borderRadius: msg.sender === 'me' ? '20px 20px 6px 20px' : '20px 20px 20px 6px',
                ...(msg.sender === 'me'
                  ? { background: accentColor, boxShadow: `0 4px 16px ${accentColor}40` }
                  : { background: CARD, border: `1px solid ${BORDER}`, boxShadow: SHADOW }
                )
              }}>
                {msg.hasImage && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,0.08)', borderRadius: 10, padding: '8px 12px', marginBottom: 8 }}>
                    <Image size={16} color={msg.sender === 'me' ? 'white' : TEXT} />
                    <span style={{ fontSize: 13, color: msg.sender === 'me' ? 'white' : TEXT }}>Photo attached</span>
                  </div>
                )}
                <p style={{ fontSize: 15, color: msg.sender === 'me' ? 'white' : TEXT, lineHeight: 1.45 }}>{msg.text}</p>
                {msg.sender === 'me' ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginTop: 4 }}>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)' }}>{msg.time}</span>
                    <CheckCheck size={14} color="rgba(255,255,255,0.65)" />
                  </div>
                ) : (
                  <p style={{ fontSize: 11, color: MUTED, marginTop: 4, textAlign: 'right' }}>{msg.time}</p>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{ position: 'fixed', bottom: 76, left: 0, right: 0, padding: '10px 14px', background: CARD, borderTop: `1px solid ${BORDER}`, zIndex: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              placeholder="Type a message..."
              data-testid="chat-input"
              style={{ flex: 1, padding: '12px 18px', background: BG, border: `1.5px solid ${(inputFocused || message.trim()) ? accentColor : BORDER}`, borderRadius: 999, color: TEXT, fontFamily: INTER, fontSize: 15, outline: 'none', transition: 'border-color 200ms' }}
            />
            <button
              onClick={handleSend}
              data-testid="chat-send-btn"
              style={{ width: 48, height: 48, borderRadius: 14, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, transition: 'background 200ms',
                background: message.trim() ? accentColor : BG,
              }}
            >
              <Send size={18} color={message.trim() ? 'white' : MUTED} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Conversations list ─────────────────────────────────────────────────────
  return (
    <div data-testid="messages-list-view" style={{ flex: 1, overflowY: 'auto', background: BG, paddingBottom: 100, fontFamily: INTER }}>
      {/* Header */}
      <div style={{ padding: '20px 20px 12px' }}>
        <h1 style={{ fontFamily: INTER, fontSize: '1.8rem', color: TEXT, letterSpacing: '-0.02em' }}>Messages</h1>
      </div>

      {/* Search */}
      <div style={{ padding: '0 16px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: CARD, border: `1px solid ${BORDER}`, boxShadow: SHADOW, borderRadius: 14, padding: '11px 16px' }}>
          <Search size={18} color={MUTED} />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search conversations..."
            data-testid="search-conversations"
            style={{ flex: 1, background: 'transparent', border: 'none', color: TEXT, fontFamily: INTER, fontSize: 15, outline: 'none' }}
          />
        </div>
      </div>

      {/* List */}
      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, margin: '0 16px', overflow: 'hidden', boxShadow: SHADOW }}>
        {filteredConversations.map((conv, i) => (
          <button
            key={conv.id}
            onClick={() => setActiveConversation(conv.id)}
            data-testid={`conversation-${conv.id}`}
            style={{ width: '100%', display: 'flex', alignItems: 'center', padding: '14px 16px', background: 'none', border: 'none', cursor: 'pointer', borderBottom: i < filteredConversations.length - 1 ? `1px solid ${BORDER}` : 'none' }}
          >
            {/* Avatar */}
            <div style={{ position: 'relative', marginRight: 14, flexShrink: 0 }}>
              {conv.isGroup ? (
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={24} color="white" />
                </div>
              ) : (
                <img src={conv.avatar} alt={conv.name} style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover' }} />
              )}
              {conv.online && (
                <div style={{ position: 'absolute', bottom: 1, right: 1, width: 13, height: 13, borderRadius: '50%', background: accentColor, border: `2px solid ${CARD}` }} />
              )}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
              <p style={{ fontSize: 16, fontWeight: 600, color: TEXT, lineHeight: 1.2 }}>
                {conv.role ? `${conv.name} (${conv.role})` : conv.name}
              </p>
              <p style={{ fontSize: 13, color: MUTED, marginTop: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{conv.lastMessage}</p>
            </div>

            {/* Meta */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginLeft: 12, flexShrink: 0, gap: 6 }}>
              <span style={{ fontSize: 12, color: MUTED }}>{conv.time}</span>
              {conv.unread > 0 && (
                <span style={{ width: 22, height: 22, background: accentColor, color: 'white', fontSize: 11, fontWeight: 700, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {conv.unread}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChatPage;
