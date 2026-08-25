import React, { useRef, useState, useCallback } from 'react';
import {
  Clock, Camera, XCircle, AlertCircle, CheckCircle,
  Home, Package, Shield, Waves, Users, Mail, ClipboardList,
  User, Wrench, Sparkles, Building2, HelpCircle, FileText,
  MoreVertical, CheckSquare, AlertTriangle, Flag,
} from 'lucide-react';
import { TaskStatus } from '../types';
import { useTheme } from '../context/ThemeContext';

const CATEGORY_ICONS = {
  opening:       Home,
  packages:      Package,
  patrol:        Shield,
  amenity:       Waves,
  coverage:      Users,
  mail:          Mail,
  documentation: FileText,
  'Resident Assist':     User,
  'Maintenance':         Wrench,
  'Cleaning':            Sparkles,
  'Vendor / Contractor': Building2,
  'Administrative':      ClipboardList,
  'Safety / Security':   Shield,
  'Amenity':             Waves,
  'Delivery':            Package,
  'Other':               HelpCircle,
};

function useLongPress(onLongPress, delay = 500) {
  const timerRef = useRef(null);
  const fired    = useRef(false);

  const start = useCallback((e) => {
    fired.current = false;
    timerRef.current = setTimeout(() => {
      fired.current = true;
      onLongPress(e);
    }, delay);
  }, [onLongPress, delay]);

  const cancel = useCallback(() => {
    clearTimeout(timerRef.current);
  }, []);

  const wasFired = useCallback(() => fired.current, []);

  return { onMouseDown: start, onMouseUp: cancel, onMouseLeave: cancel,
           onTouchStart: start, onTouchEnd: cancel, onTouchCancel: cancel, wasFired };
}

export const TaskCard = ({ task, onStartTask, onMarkUrgent, onReassign, readOnly = false, successId = null }) => {
  const { colors } = useTheme();
  const { CARD, CARD2, BORDER, TEXT, MUTED, BLUE, GREEN, RED, ORANGE, INTER } = colors;

  const [menuOpen,  setMenuOpen]  = useState(false);
  const [menuPos,   setMenuPos]   = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);

  const isCompleted = task.status === TaskStatus.COMPLETED;
  const isMissed    = task.status === TaskStatus.MISSED;
  const isPending   = !isCompleted && !isMissed;

  const isSuccess = successId === (task.id || task.task_id);

  const statusColor  = isCompleted ? GREEN : isMissed ? RED : ORANGE;
  const CatIcon      = CATEGORY_ICONS[task.category] || ClipboardList;

  const openMenu = useCallback((e) => {
    const rect = cardRef.current?.getBoundingClientRect() || {};
    setMenuPos({ x: rect.right - 160, y: rect.bottom + 6 });
    setMenuOpen(true);
  }, []);

  const lp = useLongPress(openMenu);

  return (
    <div ref={cardRef} className="stagger-item" role="listitem" style={{ position: 'relative' }}>
      {/* ── Status left bar ── */}
      <div
        data-card-focusable
        tabIndex={readOnly ? undefined : 0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !readOnly && isPending) {
            onStartTask && onStartTask(task);
            return;
          }
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            const list = e.currentTarget.closest('[data-card-list]');
            if (!list) return;
            const cards = Array.from(list.querySelectorAll('[data-card-focusable]'));
            const idx = cards.indexOf(e.currentTarget);
            const target = e.key === 'ArrowDown' ? cards[idx + 1] : cards[idx - 1];
            if (target) target.focus();
          }
        }}
        style={{
          borderRadius: 16,
          fontFamily: INTER,
          background: CARD,
          border: isCompleted
            ? '1.5px solid rgba(52,199,89,0.22)'
            : isMissed
            ? '1.5px solid rgba(255,59,48,0.28)'
            : `1px solid ${BORDER}`,
          boxShadow: isCompleted
            ? '0 4px 16px rgba(52,199,89,0.06)'
            : isMissed
            ? '0 4px 16px rgba(255,59,48,0.08)'
            : '0 2px 8px rgba(0,0,0,0.04)',
          overflow: 'hidden',
          display: 'flex',
          cursor: 'default',
          userSelect: 'none',
          outline: 'none',
        }}
        {...(!readOnly ? lp : {})}
      >
        {/* Colored left status strip */}
        <div style={{ width: 4, flexShrink: 0, background: statusColor, borderRadius: '16px 0 0 16px' }} />

        <div style={{ flex: 1, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Status icon */}
          <div style={{ width: 36, height: 36, borderRadius: 10, background: `${statusColor}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <CatIcon size={18} color={statusColor} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontFamily: INTER, fontWeight: 700, fontSize: 14, color: isCompleted ? MUTED : TEXT, margin: '0 0 3px', textDecoration: isCompleted ? 'line-through' : 'none', lineHeight: 1.3 }}>
              {task.title}
            </p>
            <p style={{ fontFamily: INTER, fontSize: 12, color: isMissed ? RED : MUTED, margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={10} color={isMissed ? RED : MUTED} />
              {isCompleted && task.completedAt ? `Completed ${task.completedAt}` : task.scheduledTime || ''}
            </p>
            {isMissed && task.missedReason && (
              <p style={{ fontFamily: INTER, fontSize: 12, color: RED, margin: '3px 0 0' }}>{task.missedReason}</p>
            )}
          </div>

          {/* Status badge */}
          <span style={{ fontFamily: INTER, fontSize: 'var(--text-xs)', fontWeight: 800, color: statusColor, background: `${statusColor}14`, borderRadius: 6, padding: '3px 8px', flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {isCompleted ? 'Done' : isMissed ? 'Missed' : 'Pending'}
          </span>

          {isPending && !readOnly && (
            <button
              onClick={e => { e.stopPropagation(); onStartTask && onStartTask(task); }}
              data-testid={`start-task-${task.id}`}
              className="touch-target"
              style={{ flexShrink: 0, padding: '7px 13px', background: `${BLUE}14`, border: 'none', borderRadius: 10, fontFamily: INTER, fontSize: 12, fontWeight: 700, color: BLUE, cursor: 'pointer', whiteSpace: 'nowrap', minHeight: 36 }}
            >
              Start
            </button>
          )}

          {!readOnly && (
            <button
              aria-label="Task options"
              onClick={e => { e.stopPropagation(); openMenu(e); }}
              className="touch-target"
              style={{ flexShrink: 0, width: 32, height: 32, background: 'none', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', borderRadius: 8, color: MUTED, minHeight: 32, minWidth: 32 }}
            >
              <MoreVertical size={16} color={MUTED} />
            </button>
          )}
        </div>
      </div>

      {/* ── Success flash overlay ── */}
      {isSuccess && (
        <div className="success-flash" style={{ position: 'absolute', inset: 0, borderRadius: 16, background: `${GREEN}22`, border: `2px solid ${GREEN}`, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 6px 20px ${GREEN}50` }}>
            <CheckCircle size={24} color="white" strokeWidth={3} />
          </div>
        </div>
      )}

      {/* ── Long-press context menu ── */}
      {menuOpen && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 998 }} onClick={() => setMenuOpen(false)} />
          <div className="context-menu-enter" style={{
            position: 'fixed', left: menuPos.x, top: menuPos.y, zIndex: 999,
            background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14,
            boxShadow: '0 12px 40px rgba(0,0,0,0.18)', overflow: 'hidden', minWidth: 160,
          }}>
            {[
              { Icon: CheckSquare, label: 'Mark Complete', color: GREEN,  cb: () => { onStartTask && onStartTask(task); setMenuOpen(false); } },
              { Icon: Flag,        label: 'Mark Urgent',   color: ORANGE, cb: () => { onMarkUrgent && onMarkUrgent(task); setMenuOpen(false); } },
              { Icon: Users,       label: 'Reassign',      color: BLUE,   cb: () => { onReassign  && onReassign(task);   setMenuOpen(false); } },
            ].map(({ Icon, label, color, cb }) => (
              <button key={label} onClick={cb}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: 'var(--space-2) var(--space-2)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: INTER, fontSize: 14, fontWeight: 600, color: TEXT }}
                onMouseEnter={e => e.currentTarget.style.background = CARD2}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <Icon size={16} color={color} />
                {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default TaskCard;
