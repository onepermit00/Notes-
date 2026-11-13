/* Planned tasks: work a manager plans for a team member, once or repeating for
   months or years. The server decides what is due each day (routes/tasks.py,
   occurs_on); these helpers mirror it so the manager sees the same dates. */

export const REPEATS = [
  { id: 'once',    label: 'Once' },
  { id: 'daily',   label: 'Every day' },
  { id: 'days',    label: 'Chosen days' },
  { id: 'weekly',  label: 'Every week' },
  { id: 'monthly', label: 'Every month' },
];
export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']; // Monday = 0, as on the server
const WEEKDAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export const MAX_YEARS_AHEAD = 5;

export const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const parseDay = key => { const [y, m, d] = String(key).split('-').map(Number); return new Date(y, m - 1, d); };
export const shiftDay = (key, days) => { const d = parseDay(key); d.setDate(d.getDate() + days); return dayKey(d); };
export const addMonths = (key, months) => { const d = parseDay(key); const day = d.getDate(); d.setDate(1); d.setMonth(d.getMonth() + months); d.setDate(Math.min(day, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate())); return dayKey(d); };
export const lastAllowedDay = (today = dayKey()) => addMonths(today, MAX_YEARS_AHEAD * 12);
const weekdayOf = key => (parseDay(key).getDay() + 6) % 7;

/* Older schedules have no repeat field: they ran on their chosen weekdays. */
export function repeatOf(plan) {
  if (REPEATS.some(r => r.id === plan.repeat)) return plan.repeat;
  const days = plan.days_of_week;
  return !Array.isArray(days) || [...days].sort().join() === '0,1,2,3,4,5,6' ? 'daily' : 'days';
}

export function occursOn(plan, day) {
  const start = plan.start_date, end = plan.end_date, repeat = repeatOf(plan);
  if (start && day < start) return false;
  if (repeat === 'once') return !!start && day === start;
  if (end && day > end) return false;
  if (repeat === 'daily') return true;
  if (repeat === 'days') return (plan.days_of_week || []).includes(weekdayOf(day));
  if (!start) return false;
  if (repeat === 'weekly') return weekdayOf(day) === weekdayOf(start);
  if (repeat === 'monthly') {
    const d = parseDay(day), wanted = parseDay(start).getDate();
    const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    return d.getDate() === Math.min(wanted, last);
  }
  return false;
}

/* The next day it is due, from today on; null once it has ended. */
export function nextDue(plan, today = dayKey()) {
  if (plan.active === false) return null;
  let day = plan.start_date && plan.start_date > today ? plan.start_date : today;
  for (let i = 0; i < 400; i++, day = shiftDay(day, 1)) {
    if (plan.end_date && day > plan.end_date) return null;
    if (repeatOf(plan) === 'once' && plan.start_date && day > plan.start_date) return null;
    if (occursOn(plan, day)) return day;
  }
  return null;
}

export const hasEnded = (plan, today = dayKey()) => plan.active !== false && !nextDue(plan, today);

export function clockText(time) {
  const m = String(time || '').match(/^(\d{1,2}):(\d{2})/);
  if (!m) return '';
  const h = Number(m[1]);
  return `${h % 12 || 12}:${m[2]} ${h < 12 ? 'AM' : 'PM'}`;
}

export const dateText = (key, withYear = true) => key ? parseDay(key).toLocaleDateString('en-US', { month: 'short', day: 'numeric', ...(withYear ? { year: 'numeric' } : {}) }) : '';

export function dueText(key, today = dayKey()) {
  if (!key) return '';
  if (key === today) return 'Today';
  if (key === shiftDay(today, 1)) return 'Tomorrow';
  return parseDay(key).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

const ordinal = n => `${n}${[11, 12, 13].includes(n % 100) ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] || 'th')}`;

/* How often, as in "Every Monday at 9:00 AM until Feb 13, 2027". */
export function repeatText(plan) {
  const repeat = repeatOf(plan);
  const at = plan.scheduled_time ? ` at ${clockText(plan.scheduled_time)}` : '';
  const until = plan.end_date ? ` until ${dateText(plan.end_date)}` : '';
  if (repeat === 'once') return `${dateText(plan.start_date)}${at}`;
  if (repeat === 'daily') return `Every day${at}${until}`;
  if (repeat === 'weekly') return `Every ${WEEKDAY_NAMES[weekdayOf(plan.start_date)]}${at}${until}`;
  if (repeat === 'monthly') return `Monthly on the ${ordinal(parseDay(plan.start_date).getDate())}${at}${until}`;
  const days = [...(plan.days_of_week || [])].sort();
  const label = days.join() === '0,1,2,3,4' ? 'Weekdays' : days.join() === '5,6' ? 'Weekends' : days.map(d => WEEKDAYS[d]).join(', ');
  return `${label}${at}${until}`;
}
