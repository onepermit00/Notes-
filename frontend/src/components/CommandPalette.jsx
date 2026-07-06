import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const INTER = "'Inter','Helvetica Neue',Arial,sans-serif";

export const CommandPalette = ({ isOpen, onClose, commands }) => {
  const { colors, isDarkMode } = useTheme();
  const { BORDER, TEXT, MUTED, BLUE } = colors;

  const [query,     setQuery]     = useState('');
  const [activeIdx, setActiveIdx] = useState(0);

  const inputRef = useRef(null);
  const listRef  = useRef(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return commands;
    return commands.filter(c =>
      c.label.toLowerCase().includes(q) ||
      c.group.toLowerCase().includes(q) ||
      (c.keywords || []).some(k => k.toLowerCase().includes(q))
    );
  }, [query, commands]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [isOpen]);

  // Reset active index when results change
  useEffect(() => { setActiveIdx(0); }, [query]);

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-palette-idx="${activeIdx}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIdx]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIdx(i => Math.min(i + 1, filtered.length - 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIdx(i => Math.max(i - 1, 0));
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        const cmd = filtered[activeIdx];
        if (cmd) { cmd.action(); onClose(); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, filtered, activeIdx, onClose]);

  if (!isOpen) return null;

  // Build grouped list preserving filter order
  const groups = [];
  const seenGroups = new Set();
  filtered.forEach(cmd => {
    if (!seenGroups.has(cmd.group)) {
      seenGroups.add(cmd.group);
      groups.push({ group: cmd.group, items: filtered.filter(c => c.group === cmd.group) });
    }
  });

  const surface = isDarkMode ? '#1C1C1E' : '#FFFFFF';
  const chipBg  = isDarkMode ? '#2C2C2E' : '#F2F2F7';

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, zIndex: 9998, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 72, background: 'rgba(0,0,0,0.52)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
    >
      <div style={{ width: '100%', maxWidth: 560, margin: '0 16px', background: surface, borderRadius: 20, boxShadow: '0 28px 80px rgba(0,0,0,0.42)', border: `1px solid ${BORDER}`, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

        {/* ── Search bar ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderBottom: `1px solid ${BORDER}`, flexShrink: 0 }}>
          <Search size={17} color={MUTED} style={{ flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Jump to a section or run an action…"
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontFamily: INTER, fontSize: 15, color: TEXT }}
          />
          <kbd style={{ fontFamily: INTER, fontSize: 10, fontWeight: 700, color: MUTED, background: chipBg, border: `1px solid ${BORDER}`, borderRadius: 6, padding: '3px 7px', letterSpacing: '0.03em', flexShrink: 0 }}>ESC</kbd>
        </div>

        {/* ── Results ── */}
        <div ref={listRef} style={{ maxHeight: 396, overflowY: 'auto', padding: '6px 0' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '36px 18px', textAlign: 'center', fontFamily: INTER, fontSize: 13, color: MUTED }}>
              No results for "{query}"
            </div>
          ) : groups.map(({ group, items }) => (
            <div key={group}>
              <div style={{ padding: '8px 18px 3px', fontFamily: INTER, fontSize: 10, fontWeight: 800, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.10em' }}>
                {group}
              </div>
              {items.map(cmd => {
                const idx = filtered.indexOf(cmd);
                const isActive = idx === activeIdx;
                const CmdIcon = cmd.Icon;
                return (
                  <button
                    key={cmd.id}
                    data-palette-idx={idx}
                    onClick={() => { cmd.action(); onClose(); }}
                    onMouseEnter={() => setActiveIdx(idx)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                      padding: '9px 18px', background: isActive ? `${BLUE}18` : 'transparent',
                      border: 'none', cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: isActive ? `${BLUE}22` : chipBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 80ms' }}>
                      <CmdIcon size={16} color={isActive ? BLUE : MUTED} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontFamily: INTER, fontSize: 14, fontWeight: 600, color: TEXT }}>{cmd.label}</span>
                      {cmd.hint && (
                        <span style={{ fontFamily: INTER, fontSize: 12, color: MUTED, marginLeft: 8 }}>{cmd.hint}</span>
                      )}
                    </div>
                    {cmd.shortcut && (
                      <kbd style={{ fontFamily: INTER, fontSize: 10, fontWeight: 700, color: MUTED, background: chipBg, border: `1px solid ${BORDER}`, borderRadius: 5, padding: '2px 6px', flexShrink: 0 }}>
                        {cmd.shortcut}
                      </kbd>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* ── Footer hints ── */}
        <div style={{ padding: '8px 18px', borderTop: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: 18, flexShrink: 0 }}>
          {[['↑↓', 'navigate'], ['↵', 'select'], ['esc', 'close']].map(([key, label]) => (
            <span key={key} style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: INTER, fontSize: 10, color: MUTED }}>
              <kbd style={{ fontFamily: INTER, fontSize: 10, fontWeight: 700, background: chipBg, border: `1px solid ${BORDER}`, borderRadius: 4, padding: '1px 5px' }}>{key}</kbd>
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
