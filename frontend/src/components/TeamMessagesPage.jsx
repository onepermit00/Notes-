import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Hash, Megaphone, Users, CheckCheck, Pin } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const GREEN  = '#34C759';
const BLUE   = '#FF385C';

// ── Mock data ──────────────────────────────────────────────────────────────────

const MGMT_NOTICES = [
  {
    id: 'n1',
    author: 'Maria Sanchez',
    role: 'Property Manager',
    time: 'Today, 8:00 AM',
    title: 'New Visitor Policy — Effective June 10',
    body: 'All visitors must present a valid photo ID at the front desk and be logged in the visitor register. Unannounced visitors must be confirmed by the resident before allowing entry. Please enforce this policy on every shift.',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    pinned: true,
  },
  {
    id: 'n2',
    author: 'Maria Sanchez',
    role: 'Property Manager',
    time: 'Yesterday, 5:00 PM',
    title: 'Monthly Fire Safety Inspection — June 14',
    body: 'Building-wide fire safety inspection is scheduled for June 14 between 9 AM–12 PM. Ensure all stairwell doors are accessible and fire extinguisher locations are clear of obstruction. Log compliance notes in the shift report.',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    pinned: false,
  },
  {
    id: 'n3',
    author: 'Maria Sanchez',
    role: 'Property Manager',
    time: 'Jun 7, 3:00 PM',
    title: 'Parking Enforcement — Reminder',
    body: 'Unauthorized vehicles in the resident parking structure will be towed starting June 15. Please remind residents arriving at the desk to register all vehicles with the office before that date.',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    pinned: false,
  },
];

const CHANNELS = [
  { id: 'mgmt',      name: 'Management Board', subtitle: 'Notices from management',  type: 'board',   unread: 2, color: BLUE,  lastMsg: 'New visitor policy — effective June 10',  lastTime: '8:00 AM'  },
  { id: 'all',       name: 'All Staff',         subtitle: 'Building-wide channel',    type: 'channel', unread: 0, color: BLUE,   lastMsg: 'Good morning everyone!',                  lastTime: 'Yesterday' },
  { id: 'concierge', name: 'Concierge',         subtitle: 'Front desk team',          type: 'channel', unread: 3, color: GREEN,  lastMsg: 'RTS package still in slot B2',            lastTime: '6:42 AM'  },
  { id: 'day',       name: 'Day Shift',         subtitle: '6 AM – 6 PM',              type: 'channel', unread: 0, color: BLUE,   lastMsg: 'Lobby polished ✓',                        lastTime: 'Yesterday' },
  { id: 'night',     name: 'Night Shift',       subtitle: '6 PM – 6 AM',              type: 'channel', unread: 1, color: '#717171', lastMsg: 'Noise complaint 12F resolved',          lastTime: '11:55 PM' },
];

const DMS = [
  { id: 'dm-maria', name: 'Maria Sanchez', role: 'Property Manager', online: true,  unread: 0, lastMsg: 'Thanks for the great shift report!',    lastTime: '2:30 PM',   avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
  { id: 'dm-james', name: 'James Okafor',  role: 'Night Concierge',  online: false, unread: 0, lastMsg: 'Handoff notes are ready for you',        lastTime: 'Yesterday', avatar: 'https://randomuser.me/api/portraits/men/32.jpg'   },
  { id: 'dm-priya', name: 'Priya Nair',    role: 'Maintenance Lead', online: true,  unread: 0, lastMsg: 'Unit 8B HVAC is fixed, should be good', lastTime: 'Yesterday', avatar: 'https://randomuser.me/api/portraits/women/68.jpg' },
];

const INIT_MSGS = {
  all: [
    { id: 1, sender: 'dm-james', name: 'James Okafor', avatar: 'https://randomuser.me/api/portraits/men/32.jpg',   text: 'Good morning everyone! Quiet night last night.',                                       time: 'Yesterday 11:55 PM' },
    { id: 2, sender: 'dm-priya', name: 'Priya Nair',   avatar: 'https://randomuser.me/api/portraits/women/68.jpg', text: "Morning! Unit 8B HVAC is fixed — took most of the night but it's running now.",       time: 'Yesterday 11:57 PM' },
    { id: 3, sender: 'me',       name: 'You',                                                                        text: 'Nice work Priya! Good morning everyone.',                                              time: '6:05 AM'            },
  ],
  concierge: [
    { id: 1, sender: 'dm-james', name: 'James Okafor', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', text: 'Heads up: 3 packages in the overflow room — 12A × 2 and 7C × 1.',                      time: '12:00 AM' },
    { id: 2, sender: 'dm-james', name: 'James Okafor', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', text: 'Luggage cart #1 checked out by unit 14A — expecting return by 9 AM. RTS still in B2.', time: '12:02 AM' },
    { id: 3, sender: 'me',       name: 'You',                                                                      text: 'Got it, thanks for the detailed handoff!',                                              time: '6:10 AM'  },
    { id: 4, sender: 'me',       name: 'You',                                                                      text: 'Luggage cart is back.',                                                                 time: '8:45 AM'  },
  ],
  day: [
    { id: 1, sender: 'me', name: 'You', text: 'Lobby polished ✓', time: 'Yesterday 7:30 AM' },
  ],
  night: [
    { id: 1, sender: 'dm-james', name: 'James Okafor', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', text: 'Noise complaint from 14F about 12F — called them, music turned down. Resolved.', time: '11:55 PM' },
  ],
  'dm-maria': [
    { id: 1, sender: 'dm-maria', name: 'Maria Sanchez', avatar: 'https://randomuser.me/api/portraits/women/44.jpg', text: 'Great shift report last night, thank you!', time: '2:30 PM' },
    { id: 2, sender: 'me',       name: 'You',                                                                         text: 'Thanks Maria! It was a busy one.',           time: '2:32 PM' },
  ],
  'dm-james': [
    { id: 1, sender: 'dm-james', name: 'James Okafor', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', text: 'Handoff notes are ready for you, check the shared doc.', time: 'Yesterday' },
    { id: 2, sender: 'me',       name: 'You',                                                                       text: 'Thanks James, see you tomorrow!',                        time: 'Yesterday' },
  ],
  'dm-priya': [
    { id: 1, sender: 'dm-priya', name: 'Priya Nair', avatar: 'https://randomuser.me/api/portraits/women/68.jpg', text: 'Unit 8B HVAC is fixed, should be fully operational.', time: 'Yesterday' },
    { id: 2, sender: 'me',       name: 'You',                                                                      text: 'Thanks Priya, the resident will be very relieved!',   time: 'Yesterday' },
  ],
};

const nowTime = () => new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

// ── Channel icon ───────────────────────────────────────────────────────────────
function ChannelIcon({ channel, size = 44 }) {
  if (channel.type === 'board') {
    return (
      <div style={{ width: size, height: size, borderRadius: size * 0.3, background: `rgba(255,56,92,0.12)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Megaphone size={size * 0.45} color={BLUE} />
      </div>
    );
  }
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.3, background: `rgba(${channel.color === GREEN ? '5,150,105' : channel.color === BLUE ? '255,56,92' : '100,116,139'},0.12)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Hash size={size * 0.4} color={channel.color} />
    </div>
  );
}

// ── DM avatar ──────────────────────────────────────────────────────────────────
function DmAvatar({ dm, size = 44 }) {
  const { colors } = useTheme();
  const { CARD } = colors;
  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <img src={dm.avatar} alt={dm.name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', display: 'block' }} />
      {dm.online && (
        <div style={{ position: 'absolute', bottom: 1, right: 1, width: 12, height: 12, borderRadius: '50%', background: GREEN, border: `2px solid ${CARD}` }} />
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export const TeamMessagesPage = () => {
  const { colors } = useTheme();
  const { BG, CARD, CARD2, TEXT, MUTED, BORDER, SHADOW, INTER } = colors;
  const [active,  setActive]  = useState(null);
  const [newMsg,  setNewMsg]  = useState('');
  const [msgs,    setMsgs]    = useState(INIT_MSGS);
  const [focused, setFocused] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, active]);

  const send = () => {
    if (!newMsg.trim() || !active || active === 'mgmt') return;
    setMsgs(p => ({ ...p, [active]: [...(p[active] || []), { id: Date.now(), sender: 'me', name: 'You', text: newMsg.trim(), time: nowTime() }] }));
    setNewMsg('');
  };

  const activeChannel = CHANNELS.find(c => c.id === active);
  const activeDm      = DMS.find(d => d.id === active);
  const activeName    = activeChannel?.name ?? activeDm?.name;

  // ── Management Board view ──────────────────────────────────────────────────
  if (active === 'mgmt') {
    return (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: BG, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px 12px', display: 'flex', alignItems: 'center', gap: 14, borderBottom: `1px solid ${BORDER}`, background: CARD, flexShrink: 0 }}>
          <button onClick={() => setActive(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
            <ArrowLeft size={22} color={MUTED} />
          </button>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,56,92,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Megaphone size={18} color={BLUE} />
          </div>
          <div>
            <div style={{ fontFamily: INTER, fontSize: 15, fontWeight: 700, color: TEXT }}>Management Board</div>
            <div style={{ fontFamily: INTER, fontSize: 12, color: MUTED }}>Notices from management</div>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {MGMT_NOTICES.map(notice => (
            <div key={notice.id} style={{ background: CARD, border: `1px solid ${notice.pinned ? BLUE : BORDER}`, borderLeft: `3px solid ${notice.pinned ? BLUE : BORDER}`, borderRadius: 16, overflow: 'hidden', boxShadow: SHADOW }}>
              <div style={{ padding: '14px 16px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <img src={notice.avatar} alt={notice.author} style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }} />
                    <div>
                      <div style={{ fontFamily: INTER, fontSize: 13, fontWeight: 700, color: TEXT }}>{notice.author}</div>
                      <div style={{ fontFamily: INTER, fontSize: 11, color: MUTED }}>{notice.role} · {notice.time}</div>
                    </div>
                  </div>
                  {notice.pinned && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,56,92,0.10)', borderRadius: 20, padding: '4px 10px' }}>
                      <Pin size={12} color={BLUE} />
                      <span style={{ fontFamily: INTER, fontSize: 11, fontWeight: 700, color: BLUE }}>Pinned</span>
                    </div>
                  )}
                </div>
                <div style={{ fontFamily: INTER, fontSize: 14, fontWeight: 700, color: TEXT, marginBottom: 6 }}>{notice.title}</div>
                <div style={{ fontFamily: INTER, fontSize: 13, color: MUTED, lineHeight: 1.55, paddingBottom: 16 }}>{notice.body}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Chat view ──────────────────────────────────────────────────────────────
  if (active) {
    const currentMsgs = msgs[active] || [];
    return (
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: BG, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '14px 20px 12px', display: 'flex', alignItems: 'center', gap: 14, borderBottom: `1px solid ${BORDER}`, background: CARD, flexShrink: 0 }}>
          <button onClick={() => setActive(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
            <ArrowLeft size={22} color={MUTED} />
          </button>
          {activeChannel ? (
            <ChannelIcon channel={activeChannel} size={40} />
          ) : activeDm ? (
            <DmAvatar dm={activeDm} size={40} />
          ) : null}
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: INTER, fontSize: 15, fontWeight: 700, color: TEXT }}>{activeName}</div>
            {activeDm?.online && <div style={{ fontFamily: INTER, fontSize: 12, color: GREEN }}>Online</div>}
            {activeChannel && <div style={{ fontFamily: INTER, fontSize: 12, color: MUTED }}>{activeChannel.subtitle}</div>}
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {currentMsgs.map((msg, i) => {
            const isMe     = msg.sender === 'me';
            const dm       = DMS.find(d => d.id === msg.sender);
            const showHead = !isMe && (i === 0 || currentMsgs[i - 1]?.sender !== msg.sender);
            return (
              <div key={msg.id}>
                {!isMe && showHead && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, marginLeft: 4 }}>
                    {dm?.avatar && <img src={dm.avatar} alt={msg.name} style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover' }} />}
                    <span style={{ fontFamily: INTER, fontSize: 12, fontWeight: 700, color: MUTED }}>{msg.name}</span>
                    <span style={{ fontFamily: INTER, fontSize: 11, color: MUTED }}>{msg.time}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '80%',
                    padding: '11px 15px',
                    borderRadius: isMe ? '20px 20px 6px 20px' : '20px 20px 20px 6px',
                    ...(isMe
                      ? { background: BLUE, boxShadow: '0 4px 16px rgba(255,56,92,0.30)' }
                      : { background: CARD, border: `1px solid ${BORDER}`, boxShadow: SHADOW }
                    ),
                  }}>
                    <p style={{ fontFamily: INTER, fontSize: 14, color: isMe ? 'white' : TEXT, lineHeight: 1.5 }}>{msg.text}</p>
                    {isMe ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginTop: 4 }}>
                        <span style={{ fontFamily: INTER, fontSize: 10, color: 'rgba(255,255,255,0.55)' }}>{msg.time}</span>
                        <CheckCheck size={13} color="rgba(255,255,255,0.55)" />
                      </div>
                    ) : (
                      <p style={{ fontFamily: INTER, fontSize: 10, color: MUTED, marginTop: 3 }}>{msg.time}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div style={{ flexShrink: 0, padding: '10px 14px 16px', background: CARD, borderTop: `1px solid ${BORDER}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input
              type="text"
              value={newMsg}
              onChange={e => setNewMsg(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={`Message ${activeName}...`}
              style={{
                flex: 1, padding: '12px 18px',
                background: CARD2,
                border: `1.5px solid ${focused || newMsg ? BLUE : BORDER}`,
                borderRadius: 999, fontFamily: INTER, fontSize: 14, color: TEXT, outline: 'none',
                transition: 'border-color 200ms',
              }}
            />
            <button onClick={send} style={{
              width: 46, height: 46, borderRadius: 13, border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0, transition: 'background 200ms',
              background: newMsg.trim() ? BLUE : CARD2,
            }}>
              <Send size={17} color={newMsg.trim() ? 'white' : MUTED} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── List view ──────────────────────────────────────────────────────────────
  const totalUnread = [...CHANNELS, ...DMS].reduce((s, c) => s + (c.unread || 0), 0);

  return (
    <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingBottom: 24, background: BG }}>

      {/* Header */}
      <div style={{ padding: '12px 20px 10px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: INTER, fontSize: 13, color: MUTED }}>Channels and direct messages</span>
        {totalUnread > 0 && (
          <div style={{ background: BLUE, borderRadius: 999, padding: '4px 10px' }}>
            <span style={{ fontFamily: INTER, fontSize: 12, fontWeight: 700, color: 'white' }}>{totalUnread} unread</span>
          </div>
        )}
      </div>

      <div style={{ padding: '14px 16px 0' }}>

        {/* ── Channels ──────────────────────────────────────────────────────── */}
        <div style={{ fontFamily: INTER, fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8 }}>CHANNELS</div>
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden', boxShadow: SHADOW, marginBottom: 24 }}>
          {CHANNELS.map((ch, i) => (
            <button key={ch.id} onClick={() => setActive(ch.id)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '13px 16px',
              background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
              borderBottom: i < CHANNELS.length - 1 ? `1px solid ${BORDER}` : 'none',
            }}>
              <ChannelIcon channel={ch} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: INTER, fontSize: 14, fontWeight: 700, color: TEXT }}>{ch.name}</span>
                  {ch.id === 'mgmt' && (
                    <span style={{ fontFamily: INTER, fontSize: 10, fontWeight: 700, color: BLUE, background: 'rgba(255,56,92,0.10)', borderRadius: 6, padding: '2px 7px' }}>MGMT</span>
                  )}
                </div>
                <div style={{ fontFamily: INTER, fontSize: 12, color: MUTED, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {ch.lastMsg}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5, flexShrink: 0 }}>
                <span style={{ fontFamily: INTER, fontSize: 11, color: MUTED }}>{ch.lastTime}</span>
                {ch.unread > 0 && (
                  <div style={{ minWidth: 22, height: 22, borderRadius: 11, background: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 6px' }}>
                    <span style={{ fontFamily: INTER, fontSize: 11, fontWeight: 700, color: 'white' }}>{ch.unread}</span>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* ── Direct Messages ────────────────────────────────────────────────── */}
        <div style={{ fontFamily: INTER, fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8 }}>DIRECT MESSAGES</div>
        <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, overflow: 'hidden', boxShadow: SHADOW }}>
          {DMS.map((dm, i) => (
            <button key={dm.id} onClick={() => setActive(dm.id)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '13px 16px',
              background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
              borderBottom: i < DMS.length - 1 ? `1px solid ${BORDER}` : 'none',
            }}>
              <DmAvatar dm={dm} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: INTER, fontSize: 14, fontWeight: 700, color: TEXT }}>
                  {dm.name}
                  <span style={{ fontFamily: INTER, fontSize: 12, fontWeight: 500, color: MUTED, marginLeft: 6 }}>· {dm.role}</span>
                </div>
                <div style={{ fontFamily: INTER, fontSize: 12, color: MUTED, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {dm.lastMsg}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5, flexShrink: 0 }}>
                <span style={{ fontFamily: INTER, fontSize: 11, color: MUTED }}>{dm.lastTime}</span>
                {dm.unread > 0 && (
                  <div style={{ minWidth: 22, height: 22, borderRadius: 11, background: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 6px' }}>
                    <span style={{ fontFamily: INTER, fontSize: 11, fontWeight: 700, color: 'white' }}>{dm.unread}</span>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

      </div>
    </div>
  );
};

export default TeamMessagesPage;
