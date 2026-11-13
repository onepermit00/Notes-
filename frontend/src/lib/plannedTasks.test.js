import { addMonths, lastAllowedDay, nextDue, occursOn, repeatText } from './plannedTasks';

test('repeat rules match the server', () => {
  expect(occursOn({ repeat: 'once', start_date: '2026-11-16' }, '2026-11-16')).toBe(true);
  expect(occursOn({ repeat: 'once', start_date: '2026-11-16' }, '2026-11-23')).toBe(false);
  expect(occursOn({ repeat: 'weekly', start_date: '2026-11-16' }, '2026-12-07')).toBe(true);
  expect(occursOn({ repeat: 'days', start_date: '2026-11-16', days_of_week: [1, 3] }, '2026-11-17')).toBe(true);
  expect(occursOn({ repeat: 'monthly', start_date: '2026-01-31' }, '2026-02-28')).toBe(true);
  expect(occursOn({ repeat: 'daily', start_date: '2026-11-16', end_date: '2027-01-01' }, '2027-01-02')).toBe(false);
  expect(occursOn({ start_date: '2026-11-01', days_of_week: [0] }, '2026-11-16')).toBe(true);
});

test('next due day and plain-English schedule', () => {
  expect(nextDue({ repeat: 'weekly', start_date: '2026-11-16' }, '2026-11-18')).toBe('2026-11-23');
  expect(nextDue({ repeat: 'once', start_date: '2026-11-10' }, '2026-11-18')).toBe(null);
  expect(nextDue({ repeat: 'daily', start_date: '2026-11-16', active: false }, '2026-11-18')).toBe(null);
  expect(repeatText({ repeat: 'weekly', start_date: '2026-11-16', scheduled_time: '09:00', end_date: '2027-02-13' }))
    .toBe('Every Monday at 9:00 AM until Feb 13, 2027');
  expect(repeatText({ repeat: 'days', days_of_week: [0, 1, 2, 3, 4], scheduled_time: '18:30' })).toBe('Weekdays at 6:30 PM');
  expect(repeatText({ repeat: 'monthly', start_date: '2026-12-01' })).toBe('Monthly on the 1st');
});

test('dates months and years ahead', () => {
  expect(addMonths('2026-01-31', 1)).toBe('2026-02-28');
  expect(lastAllowedDay('2026-11-13')).toBe('2031-11-13');
});
