import React from 'react';
import { toNarrative } from '../../lib/toNarrative';
import { DASHBOARD_ACCENT, DASHBOARD_DANGER, DASHBOARD_FONT, DASHBOARD_SUCCESS } from './tokens';

const DEFAULT_SECTIONS = [
  ['packages', 'Packages'], ['guests', 'Guests'], ['tasks', "Today's Tasks"],
  ['loaners', 'Loaners'], ['lockouts', 'Lockouts'], ['vendors', 'Vendors'],
  ['tours', 'Tours'], ['security', 'Security & Rounds'], ['incidents', 'Incidents Filed'],
];

const sourceOf = (entry = {}) => {
  const persisted = entry._source || entry.source_section || entry.sourceSection;
  if (persisted) return persisted;
  const title = (entry.title || '').toLowerCase();
  if (/package|delivery|rts|carrier pickup/.test(title) || entry.category === 'Delivery') return 'packages';
  if (/guest|visitor|resident notified|arrival/.test(title)) return 'guests';
  if (/lockout/.test(title)) return 'lockouts';
  if (/vendor/.test(title) || entry.category === 'Vendor / Contractor') return 'vendors';
  if (/tour|move-in|move-out/.test(title)) return 'tours';
  if (/loaner|luggage cart|key fob|umbrella/.test(title)) return 'loaners';
  if (/rounds|security check|patrol/.test(title)) return 'security';
  return 'tasks';
};

export const buildDailyActivitySections = (shift, { taskEntries, incidents, customSections = [] } = {}) => {
  const activities = shift?.activities || [];
  const buckets = Object.fromEntries(DEFAULT_SECTIONS.map(([id]) => [id, []]));
  activities.forEach(entry => (buckets[sourceOf(entry)] ||= []).push(entry));
  if (taskEntries) buckets.tasks = taskEntries;
  if (shift?.note) buckets.tasks = [{ id:'shift-note', text:shift.note }, ...buckets.tasks];
  buckets.incidents = incidents ?? shift?.incidents ?? [];
  return [
    ...DEFAULT_SECTIONS.map(([id, title]) => ({ id, title, entries: buckets[id], critical: id === 'incidents', wide: ['tasks', 'security', 'incidents'].includes(id) })),
    ...customSections.map(section => ({
      id: section.id,
      title: section.label || section.title,
      entries: activities.filter(entry => sourceOf(entry) === section.id),
      wide: !!section.wide,
    })),
  ];
};

const ReportEntry = ({ entry }) => {
  const isObject = entry && typeof entry === 'object';
  const raw = isObject ? (entry.text || toNarrative(entry)) : String(entry || '');
  const divider = raw.indexOf(' — ');
  const time = divider > -1 ? raw.slice(0, divider) : '';
  let text = divider > -1 ? raw.slice(divider + 3) : raw;
  if (!isObject || entry.text) {
    const incident = text.replace(/\s+/g, ' ').trim().match(/^([^:]{2,40}):\s*(.+)$/);
    text = incident ? `${incident[1]} incident reported. ${incident[2]}` : text;
    if (text) text = `${text.charAt(0).toUpperCase()}${text.slice(1)}${/[.!?]$/.test(text) ? '' : '.'}`;
  }
  return <div className="dar-entry">
    {time && <time>{time}</time>}
    <span className="dar-print-entry">{text}</span>
  </div>;
};

export function DailyActivityReport({
  mode = 'concierge', shift, sections, customSections, taskEntries, incidents,
  editable = false, showConciergeIdentity = true, propertyName = 'The Hannah',
  propertyAddress = '1306 Callowhill Street · Philadelphia PA 19123', dateLabel,
  loading = false, emptyAction, emptyActionLabel = 'Start Shift',
  colors = {}, className = '', style, testId,
}) {
  const palette = { card:'#fff', card2:'#f7f7f7', text:'#222', muted:'#717171', border:'#e5e5e5', shadow:'0 2px 12px rgba(0,0,0,.06)', ...colors };
  const reportSections = sections || buildDailyActivitySections(shift, { taskEntries, incidents, customSections });
  const reportDate = dateLabel || shift?.dateLabel || new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' });

  return <article className={`daily-activity-report dar-print-target ${className}`} data-testid={testId} data-mode={mode} data-editable={editable || undefined} style={{ '--dar-card':palette.card, '--dar-card-2':palette.card2, '--dar-text':palette.text, '--dar-muted':palette.muted, '--dar-border':palette.border, '--dar-shadow':palette.shadow, ...style }}>
    <style>{`
      .daily-activity-report{background:var(--dar-card);border:1px solid var(--dar-border);border-radius:20px;overflow:hidden;box-shadow:var(--dar-shadow);font-family:${DASHBOARD_FONT}}
      .dar-report-header{background:#0b0b0b;color:#fff;padding:24px 28px 20px}.dar-header-row{display:flex;justify-content:space-between;align-items:flex-start;gap:20px}.dar-kicker{display:flex;align-items:center;gap:10px;margin-bottom:8px;color:rgba(255,255,255,.55);font-size:10px;font-weight:800;letter-spacing:.24em;text-transform:uppercase}.dar-kicker:before{content:"";width:28px;height:2px;background:${DASHBOARD_ACCENT}}.dar-name{font-size:24px;font-weight:800;letter-spacing:-.035em;margin-bottom:6px}.dar-subtitle{font-size:13px;color:rgba(255,255,255,.55)}
      .dar-screen-grid{margin:16px;border:1px solid color-mix(in srgb, ${DASHBOARD_ACCENT} 28%, var(--dar-border));border-radius:16px;overflow:hidden;display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}.dar-category-block{background:var(--dar-card);min-width:0;padding:18px 20px;border-top:1px solid var(--dar-border)}.dar-category-block.right{border-left:1px solid var(--dar-border)}.dar-category-block.wide{grid-column:1/-1}.dar-section-head{min-height:28px;display:flex;align-items:center;gap:10px}.dar-index{width:26px;height:26px;border-radius:8px;background:var(--dar-card-2);display:inline-flex;align-items:center;justify-content:center;font-size:8px;font-weight:800;color:var(--dar-muted);letter-spacing:.08em;flex-shrink:0}.dar-category-block.populated .dar-index{background:color-mix(in srgb, ${DASHBOARD_ACCENT} 9%, transparent);color:${DASHBOARD_ACCENT}}.dar-category-block.critical.populated .dar-index{color:${DASHBOARD_DANGER}}.dar-section-title{flex:1;font-size:13px;font-weight:750;color:var(--dar-text);margin:0}.dar-section-body{padding:8px 0 0 38px;min-height:30px}.dar-empty{font-size:12px;color:var(--dar-muted)}.dar-entry{display:grid;grid-template-columns:68px minmax(0,1fr);align-items:start;gap:10px;padding:7px 0}.dar-entry:not(:first-child){border-top:1px solid color-mix(in srgb, ${DASHBOARD_ACCENT} 22%, transparent)}.dar-entry:not(:has(time)){grid-template-columns:minmax(0,1fr)}.dar-entry time{padding-top:2px;font-size:10px;font-weight:750;color:var(--dar-muted);letter-spacing:.02em;white-space:nowrap;text-transform:uppercase}.dar-print-entry{font-size:14px;color:var(--dar-text);line-height:1.65}.dar-state{padding:52px 24px;text-align:center;color:var(--dar-muted);font-size:14px}.dar-state button{margin-top:16px;padding:11px 24px;border:0;border-radius:999px;background:${DASHBOARD_SUCCESS};color:#fff;font-weight:700;cursor:pointer}.dar-print-only{display:none}
      @media(max-width:760px){.dar-report-header{padding:18px 20px}.dar-kicker:before{width:22px}.dar-name{font-size:17px}.dar-screen-grid{grid-template-columns:1fr;margin:12px}.dar-category-block,.dar-category-block.right{padding:16px 14px;border-left:0}.dar-category-block.wide{grid-column:auto}.dar-entry{grid-template-columns:58px minmax(0,1fr) auto}.dar-print-entry{font-size:13px}}
      @media print{body *{visibility:hidden!important}.dar-print-target,.dar-print-target *{visibility:visible!important}.dar-print-target{position:absolute!important;inset:0 auto auto 0!important;width:100%!important;border:0!important;border-radius:0!important;box-shadow:none!important;background:#fff!important;overflow:visible!important}.dar-screen-only{display:none!important}.dar-print-only{display:block!important}.dar-report-header{display:none!important}.dar-print-masthead{padding:0 0 14pt;border-bottom:1.5pt solid #0d1117;margin-bottom:12pt}.dar-print-title{font:700 25pt Georgia,serif;letter-spacing:.04em;text-transform:uppercase}.dar-print-meta{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16pt;padding:10pt 0;border-bottom:.75pt solid #ccc}.dar-screen-grid{display:block!important;margin:0!important;border:0!important;border-radius:0!important}.dar-category-block{border:0!important;border-top:1.5pt solid #0d1117!important;padding:4pt 0 5pt!important;break-inside:avoid}.dar-category-block.right{border-left:0!important}.dar-index,.dar-count{display:none!important}.dar-section-head{min-height:0!important}.dar-section-title{font-size:9pt!important;letter-spacing:.12em;text-transform:uppercase}.dar-section-body{padding:2pt 0!important;min-height:0!important}.dar-print-entry{font:400 10.5pt/1.6 Inter,sans-serif!important;color:#1a1a1a!important}.dar-entry{padding:2pt 0!important}.dar-evidence{display:none!important}@page{margin:.7in}}
    `}</style>
    {loading ? <div className="dar-state" role="status">Loading Daily Activity Report…</div> : !shift ? <div className="dar-state"><div>No active shift today</div>{emptyAction && <button type="button" onClick={emptyAction}>{emptyActionLabel}</button>}</div> : <>
      <header className="dar-report-header dar-screen-only">
        <div className="dar-header-row"><div><div className="dar-kicker">Daily Activity Report</div>{showConciergeIdentity && <div className="dar-name">{shift.concierge?.name || shift.conciergeName || 'Concierge'}</div>}<div className="dar-subtitle">{reportDate}</div></div></div>
      </header>
      <div className="dar-print-only dar-print-masthead"><div className="dar-print-title">Daily Shift Notes</div><div>{propertyName} · {propertyAddress}</div><div className="dar-print-meta"><div><b>Date</b><br/>{reportDate}</div><div><b>Shift</b><br/>{shift.clockIn || '—'} – {shift.clockOut || 'Present'}</div><div><b>Concierge</b><br/>{shift.concierge?.name || shift.conciergeName || 'Concierge'}</div></div></div>
      <div className="dar-screen-grid">{reportSections.map((section, index) => { const entries = section.entries || []; const populated = section.populated ?? entries.length > 0; const narrowIndex = reportSections.slice(0, index).filter(item => !item.wide).length; return <section key={section.id || section.title} className={`dar-category-block ${section.wide ? 'wide' : ''} ${!section.wide && narrowIndex % 2 ? 'right' : ''} ${section.critical ? 'critical' : ''} ${populated ? 'populated' : ''}`}><div className="dar-section-head"><span className="dar-index">{String(index + 1).padStart(2,'0')}</span><h3 className="dar-section-title">{section.title}</h3></div><div className="dar-section-body">{section.content || (entries.length ? entries.map((entry, i) => <ReportEntry key={entry?.id || i} entry={entry}/>) : <span className="dar-empty">{section.emptyLabel || (section.critical ? 'No incidents this shift.' : 'No activity recorded')}</span>)}</div></section>; })}</div>
    </>}
  </article>;
}

export default DailyActivityReport;
