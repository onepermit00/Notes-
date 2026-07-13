import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import MicButton from './MicButton';

const STORAGE_KEY = 'adltrack_followups';

const load  = () => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; } };
const save  = items => localStorage.setItem(STORAGE_KEY, JSON.stringify(items));

const STATUS_CFG = {
  open:        { label: 'Open',        color: '#FF9500', bg: 'rgba(255,149,0,0.12)'   },
  'in-progress': { label: 'In Progress', color: '#FF385C', bg: 'rgba(255,56,92,0.10)'  },
  resolved:    { label: 'Resolved',    color: '#34C759', bg: 'rgba(52,199,89,0.12)'   },
};

export function useFollowUps() {
  const [items, setItems] = useState(load);
  const add = item => {
    const entry = { id: Date.now(), createdAt: new Date().toLocaleString('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}), status:'open', ...item };
    setItems(prev => { const next = [entry, ...prev]; save(next); return next; });
  };
  const update = (id, status) => setItems(prev => { const next = prev.map(i => i.id === id ? { ...i, status } : i); save(next); return next; });
  const remove = id => setItems(prev => { const next = prev.filter(i => i.id !== id); save(next); return next; });
  return { items, add, update, remove };
}

export default function FollowUpTracker({ colors, INTER, followUps }) {
  const { BG, CARD, CARD2, BORDER, TEXT, MUTED, SHADOW } = colors;
  const { items, add, update, remove } = followUps;
  const [text, setText] = useState('');
  const [adding, setAdding] = useState(false);
  const [filter, setFilter] = useState('open');

  const submit = () => {
    if (!text.trim()) return;
    add({ text: text.trim(), source: 'manual' });
    setText(''); setAdding(false);
  };

  const open     = items.filter(i => i.status === 'open').length;
  const inProg   = items.filter(i => i.status === 'in-progress').length;
  const resolved = items.filter(i => i.status === 'resolved').length;
  const visible  = filter === 'all' ? items : items.filter(i => i.status === filter);

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

      {/* Stats row */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
        {[
          { label:'Open',        count:open,     color:'#FF9500', key:'open'        },
          { label:'In Progress', count:inProg,   color:'#FF385C', key:'in-progress' },
          { label:'Resolved',    count:resolved, color:'#34C759', key:'resolved'    },
        ].map(({ label, count, color, key }) => (
          <button key={key} onClick={() => setFilter(filter === key ? 'all' : key)}
            style={{ padding:'14px 10px', borderRadius:14, border:`1.5px solid ${filter===key ? color : BORDER}`, background: filter===key ? `${color}10` : CARD, cursor:'pointer', textAlign:'center', boxShadow: SHADOW }}>
            <div style={{ fontFamily:INTER, fontSize:22, fontWeight:800, color, marginBottom:3 }}>{count}</div>
            <div style={{ fontFamily:INTER, fontSize:11, fontWeight:600, color:MUTED }}>{label}</div>
          </button>
        ))}
      </div>

      {/* Add item */}
      {adding ? (
        <div style={{ background:CARD, border:`1.5px solid ${BORDER}`, borderRadius:16, padding:16, display:'flex', flexDirection:'column', gap:12 }}>
          <div style={{ position:'relative' }}>
            <textarea
              autoFocus rows={2}
              placeholder="Describe the follow-up item…"
              value={text} onChange={e => setText(e.target.value)}
              style={{ width:'100%', padding:'12px 44px 12px 14px', borderRadius:12, border:`1.5px solid ${BORDER}`, fontFamily:INTER, fontSize:14, color:TEXT, background:CARD2, outline:'none', resize:'none', boxSizing:'border-box', lineHeight:1.5 }}
            />
            <MicButton onTranscript={t => setText(p => p ? p+' '+t : t)} />
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={() => { setAdding(false); setText(''); }}
              style={{ flex:1, padding:'11px 0', borderRadius:10, border:`1px solid ${BORDER}`, background:CARD2, fontFamily:INTER, fontSize:13, fontWeight:600, color:MUTED, cursor:'pointer' }}>
              Cancel
            </button>
            <button onClick={submit} disabled={!text.trim()}
              style={{ flex:2, padding:'11px 0', borderRadius:10, border:'none', background: text.trim() ? '#FF385C' : CARD2, fontFamily:INTER, fontSize:13, fontWeight:700, color: text.trim() ? 'white' : MUTED, cursor: text.trim() ? 'pointer' : 'not-allowed' }}>
              Add Follow-up
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)}
          style={{ width:'100%', padding:'15px 20px', background:'#FF385C', border:'none', borderRadius:16, fontFamily:INTER, fontSize:15, fontWeight:700, color:'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:'0 6px 20px rgba(255,56,92,0.28)' }}>
          <Plus size={18} /> Add Follow-up Item
        </button>
      )}

      {/* List */}
      {visible.length === 0 ? (
        <div style={{ textAlign:'center', padding:'32px 0', color:MUTED, fontFamily:INTER, fontSize:14 }}>
          {filter === 'resolved' ? 'No resolved items yet.' : 'No open follow-ups — great work!'}
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {visible.map(item => {
            const cfg = STATUS_CFG[item.status];
            return (
              <div key={item.id} style={{ background:CARD, border:`1px solid ${BORDER}`, borderRadius:14, padding:'14px 16px', boxShadow:SHADOW }}>
                <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontFamily:INTER, fontSize:14, color:TEXT, lineHeight:1.5, margin:'0 0 6px', wordBreak:'break-word' }}>{item.text}</p>
                    <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                      <span style={{ fontFamily:INTER, fontSize:11, color:MUTED }}>{item.createdAt}</span>
                      {item.source && item.source !== 'manual' && (
                        <span style={{ fontFamily:INTER, fontSize:10, fontWeight:700, color:MUTED, background:CARD2, borderRadius:6, padding:'2px 6px', textTransform:'uppercase', letterSpacing:'0.06em' }}>{item.source}</span>
                      )}
                      <span style={{ fontFamily:INTER, fontSize:11, fontWeight:700, color:cfg.color, background:cfg.bg, borderRadius:8, padding:'2px 8px' }}>{cfg.label}</span>
                    </div>
                  </div>
                  <button onClick={() => remove(item.id)}
                    style={{ width:24, height:24, borderRadius:'50%', border:'none', background:CARD2, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0, marginTop:2 }}>
                    <X size={12} color={MUTED} />
                  </button>
                </div>
                {/* Status actions */}
                {item.status !== 'resolved' && (
                  <div style={{ display:'flex', gap:8, marginTop:12 }}>
                    {item.status === 'open' && (
                      <button onClick={() => update(item.id,'in-progress')}
                        style={{ flex:1, padding:'8px 0', borderRadius:8, border:`1px solid rgba(255,56,92,0.3)`, background:'rgba(255,56,92,0.07)', fontFamily:INTER, fontSize:12, fontWeight:600, color:'#FF385C', cursor:'pointer' }}>
                        Start
                      </button>
                    )}
                    <button onClick={() => update(item.id,'resolved')}
                      style={{ flex:1, padding:'8px 0', borderRadius:8, border:`1px solid rgba(52,199,89,0.3)`, background:'rgba(52,199,89,0.07)', fontFamily:INTER, fontSize:12, fontWeight:600, color:'#34C759', cursor:'pointer' }}>
                      Resolve
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
