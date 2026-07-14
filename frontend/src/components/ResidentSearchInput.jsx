import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, User, Phone, Mail, FileText, X } from 'lucide-react';
import { authApi } from '../services/authApi';

export default function ResidentSearchInput({ colors, INTER, onSelect, placeholder = 'Search resident by name or unit…' }) {
  const { CARD, CARD2, BORDER, TEXT, MUTED, SHADOW } = colors;
  const [query, setQuery] = useState('');
  const [residents, setResidents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const dropRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    authApi.getResidents().then(r => { setResidents(r || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!query.trim()) { setFiltered([]); return; }
    const q = query.toLowerCase();
    setFiltered(residents.filter(r =>
      (r.name || '').toLowerCase().includes(q) ||
      (r.unit || '').toLowerCase().includes(q)
    ).slice(0, 8));
  }, [query, residents]);

  useEffect(() => {
    const handler = e => { if (dropRef.current && !dropRef.current.contains(e.target) && inputRef.current && !inputRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const pick = r => { setSelected(r); setQuery(r.name); setOpen(false); if (onSelect) onSelect(r); };
  const clear = () => { setSelected(null); setQuery(''); setFiltered([]); if (onSelect) onSelect(null); };

  return (
    <div style={{ position:'relative' }}>
      {/* Input */}
      <div style={{ position:'relative', display:'flex', alignItems:'center' }}>
        <Search size={15} color={MUTED} style={{ position:'absolute', left:14, pointerEvents:'none' }} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setSelected(null); setOpen(true); }}
          onFocus={() => query && setOpen(true)}
          placeholder={placeholder}
          style={{ width:'100%', padding:'12px 40px 12px 38px', borderRadius:12, border:`1.5px solid ${BORDER}`, fontFamily:INTER, fontSize:14, color:TEXT, background:CARD2, outline:'none', boxSizing:'border-box' }}
        />
        {query && (
          <button onClick={clear} style={{ position:'absolute', right:12, background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center' }}>
            <X size={15} color={MUTED} />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && filtered.length > 0 && (
        <div ref={dropRef}
          style={{ position:'absolute', top:'100%', left:0, right:0, zIndex:200, marginTop:4, background:CARD, border:`1.5px solid ${BORDER}`, borderRadius:14, boxShadow:'0 8px 32px rgba(0,0,0,0.18)', overflow:'hidden' }}>
          {filtered.map(r => (
            <button key={r.resident_id || r._id || r.name} onMouseDown={() => pick(r)}
              style={{ width:'100%', display:'flex', alignItems:'center', gap:12, padding:'11px 14px', background:'none', border:'none', borderBottom:`1px solid ${BORDER}`, cursor:'pointer', textAlign:'left' }}>
              <div style={{ width:32, height:32, borderRadius:'50%', background:'rgba(255,56,92,0.12)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <User size={15} color='#FF385C' />
              </div>
              <div>
                <div style={{ fontFamily:INTER, fontSize:14, fontWeight:600, color:TEXT }}>{r.name}</div>
                <div style={{ fontFamily:INTER, fontSize:12, color:MUTED }}>Unit {r.unit}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Resident card */}
      {selected && (
        <div style={{ marginTop:10, background:CARD, border:`1.5px solid rgba(255,56,92,0.25)`, borderRadius:14, padding:'14px 16px', display:'flex', flexDirection:'column', gap:8 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:'50%', background:'rgba(255,56,92,0.12)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <User size={17} color='#FF385C' />
            </div>
            <div>
              <div style={{ fontFamily:INTER, fontSize:15, fontWeight:700, color:TEXT }}>{selected.name}</div>
              <div style={{ fontFamily:INTER, fontSize:12, color:MUTED }}>Unit {selected.unit}</div>
            </div>
          </div>
          {(selected.phone || selected.email || selected.notes) && (
            <div style={{ display:'flex', flexDirection:'column', gap:5, paddingTop:8, borderTop:`1px solid ${BORDER}` }}>
              {selected.phone && (
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <Phone size={12} color={MUTED} />
                  <span style={{ fontFamily:INTER, fontSize:13, color:TEXT }}>{selected.phone}</span>
                </div>
              )}
              {selected.email && (
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <Mail size={12} color={MUTED} />
                  <span style={{ fontFamily:INTER, fontSize:13, color:TEXT }}>{selected.email}</span>
                </div>
              )}
              {selected.notes && (
                <div style={{ display:'flex', alignItems:'flex-start', gap:8, marginTop:2 }}>
                  <FileText size={12} color={MUTED} style={{ marginTop:2, flexShrink:0 }} />
                  <span style={{ fontFamily:INTER, fontSize:12, color:MUTED, lineHeight:1.5 }}>{selected.notes}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
