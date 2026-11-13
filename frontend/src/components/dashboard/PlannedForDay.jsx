import React, { useCallback, useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { authApi } from '../../services/authApi';
import { useTheme } from '../../context/ThemeContext';
import { clockText, dayKey } from '../../lib/plannedTasks';
import { DASHBOARD_ACCENT, DASHBOARD_DANGER, DASHBOARD_FONT, DASHBOARD_SUCCESS } from './tokens';

const BLUE = DASHBOARD_ACCENT, RED = DASHBOARD_DANGER, GREEN = DASHBOARD_SUCCESS, INTER = DASHBOARD_FONT;

export const fmtDayLong = key => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
};

/* What is planned for each day of the month on screen in a Shifts calendar,
   keyed by YYYY-MM-DD. refresh() reloads it after something is scheduled. */
export function usePlannedCalendar(active, monthDate) {
  const [items, setItems] = useState({});
  const [version, setVersion] = useState(0);
  const y = monthDate.getFullYear(), m = monthDate.getMonth();
  useEffect(() => {
    if (!active) return undefined;
    let live = true;
    authApi.getScheduleCalendar(dayKey(new Date(y, m, 1)), dayKey(new Date(y, m + 1, 0)))
      .then(days => { if (live) setItems(days); })
      .catch(() => { if (live) setItems({}); });
    return () => { live = false; };
  }, [active, y, m, version]);
  const refresh = useCallback(() => setVersion(v => v + 1), []);
  return [items, refresh];
}

/* Shifts | Schedule task, at the top of the Shifts page. */
export function ShiftsViewTabs({ view, onChange, isMobile = false }) {
  const { colors } = useTheme();
  const { CARD, CARD2, BORDER, TEXT, MUTED } = colors;
  return (
    <div role="tablist" aria-label="Shifts views" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 4, padding: 4, background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 14, maxWidth: 460 }}>
      {[['calendar', 'Shifts'], ['schedule', 'Schedule task']].map(([id, label]) => {
        const sel = view === id;
        return (
          <button key={id} type="button" role="tab" aria-selected={sel} data-testid={`shifts-view-${id}`} onClick={() => onChange(id)}
            style={{ minHeight: 44, padding: '0 8px', border: sel ? `1px solid ${BORDER}` : '1px solid transparent', borderRadius: 11, background: sel ? CARD : 'transparent', boxShadow: sel ? '0 2px 8px rgba(0,0,0,.07)' : 'none', color: sel ? TEXT : MUTED, fontFamily: INTER, fontSize: isMobile ? 13 : 14, fontWeight: 750, cursor: 'pointer', transition: 'all 160ms' }}>
            {label}
          </button>
        );
      })}
    </div>
  );
}

/* One day's planned items: bookings, visits and tasks left for whoever is on duty. */
export function PlannedForDay({ day, items = [], isMobile = false, onSchedule, onRemove }) {
  const { colors } = useTheme();
  const { CARD, CARD2, BORDER, TEXT, MUTED, SHADOW } = colors;
  const today = dayKey();
  const t12 = v => (v ? clockText(v) : '');
  return (
    <section aria-label={`Planned for ${fmtDayLong(day)}`} data-testid="planned-for-day" style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, boxShadow: SHADOW, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: isMobile ? '14px 16px' : '16px 20px', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: INTER, fontSize: 9, fontWeight: 800, color: BLUE, letterSpacing: '.16em', textTransform: 'uppercase', marginBottom: 4 }}>Planned</div>
          <h3 style={{ fontFamily: INTER, fontSize: 16, fontWeight: 800, color: TEXT, margin: 0, letterSpacing: '-.02em' }}>{fmtDayLong(day)}</h3>
        </div>
        {day >= today && onSchedule && (
          <button type="button" data-testid="planned-schedule" onClick={() => onSchedule(day)} style={{ minHeight: 38, padding: '0 14px', border: 0, borderRadius: 999, background: BLUE, color: 'white', fontFamily: INTER, fontSize: 12, fontWeight: 750, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <Plus size={14} />Schedule
          </button>
        )}
      </div>
      {items.length === 0 ? (
        <p style={{ fontFamily: INTER, fontSize: 13, color: MUTED, margin: 0, padding: isMobile ? '14px 16px' : '16px 20px' }}>Nothing planned for this day.</p>
      ) : items.map((item, i) => {
        const done = item.status === 'completed';
        const notDone = day < today && !done;
        return (
          <div key={item.scheduled_task_id + i} data-testid="planned-row" style={{ display: 'grid', gridTemplateColumns: '64px minmax(0,1fr) auto', gap: 12, alignItems: 'start', padding: isMobile ? '13px 16px' : '14px 20px', borderTop: i ? `1px solid ${BORDER}` : 'none' }}>
            <div style={{ fontFamily: INTER, fontSize: 12, fontWeight: 800, color: TEXT, lineHeight: 1.35 }}>{t12(item.time)}{item.end_time && <div style={{ fontWeight: 500, color: MUTED }}>to {t12(item.end_time)}</div>}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: INTER, fontSize: 14, fontWeight: 750, color: TEXT, lineHeight: 1.35, overflowWrap: 'anywhere' }}>{item.title}</div>
              {item.notes && <div style={{ fontFamily: INTER, fontSize: 12, color: MUTED, marginTop: 3, lineHeight: 1.45 }}>{item.notes}</div>}
              <div style={{ fontFamily: INTER, fontSize: 11, color: MUTED, marginTop: 4 }}>
                {[`For ${item.for_name || 'whoever is on duty'}`, item.added_by ? `Added by ${item.added_by}` : '', item.repeat !== 'once' ? 'Repeats' : '', done && item.done_by ? `Done by ${item.done_by}` : ''].filter(Boolean).join(' · ')}
              </div>
              {onRemove && item.mine && day >= today && !done && item.repeat === 'once' && (
                <button type="button" onClick={() => onRemove(item)} style={{ marginTop: 8, minHeight: 30, padding: '0 10px', border: `1px solid ${BORDER}`, borderRadius: 999, background: CARD, color: MUTED, fontFamily: INTER, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Remove</button>
              )}
            </div>
            <span style={{ fontFamily: INTER, fontSize: 9, fontWeight: 800, letterSpacing: '.06em', textTransform: 'uppercase', borderRadius: 999, padding: '4px 8px', color: done ? GREEN : notDone ? RED : MUTED, background: done ? `${GREEN}12` : notDone ? `${RED}10` : CARD2, whiteSpace: 'nowrap' }}>{done ? 'Done' : notDone ? 'Not done' : 'Planned'}</span>
          </div>
        );
      })}
    </section>
  );
}

export default PlannedForDay;
