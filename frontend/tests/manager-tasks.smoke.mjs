import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const manager = { user_id:'qa-manager', user_type:'manager', name:'Sarah Thompson', email:'sarah@example.com', property_name:'The Hannah' };
const concierge = { concierge_id:'c1', first_name:'George', last_name:'Nwachukwu', name:'George Nwachukwu', initials:'GN', title:'Head Concierge', status:'on_shift' };
let tasks = [
  { task_id:'t1', title:'Inspect lobby doors', category:'Safety / Security', priority:'High', assigned_to:'George N.', assigned_to_id:'c1', due_time:'ASAP', status:'pending', created_by_type:'manager' },
  { task_id:'t2', title:'Prepare move-in packet', category:'Administrative', priority:'Standard', assigned_to:'George N.', assigned_to_id:'c1', due_time:'End of shift', status:'in_progress', created_by_type:'manager' },
  { task_id:'t3', title:'Close pool', category:'Amenity', priority:'Standard', assigned_to:'George N.', assigned_to_id:'c1', due_time:'Tonight', status:'completed', created_by_type:'manager' },
];
let schedules = [{ scheduled_task_id:'s1', title:'Opening lobby round', category:'Administrative', priority:'Standard', recurrence:'daily', scheduled_hour:8, scheduled_time:'08:00', start_date:'2026-10-01', end_date:'2026-12-01', days_of_week:[0,1,2,3,4], shift_window:'morning', assigned_concierge_id:'c1', assigned_concierge_name:'George Nwachukwu', active:true, notes:'Check all entrances.' }];

const browser = await chromium.launch({ headless:true });
const context = await browser.newContext({ viewport:{ width:1440, height:1000 } });
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
await page.route('**/api/**', async route => {
  const req = route.request(); const url = req.url(); const method = req.method();
  let body = {};
  if (url.endsWith('/api/auth/me')) body = manager;
  else if (url.includes('/api/manager/concierges')) body = { concierges:[concierge] };
  else if (url.endsWith('/api/tasks') && method === 'GET') body = { tasks };
  else if (url.endsWith('/api/tasks') && method === 'POST') { const p=req.postDataJSON(); const made={ task_id:'created', ...p, status:'pending', created_by_type:'manager' }; tasks=[made,...tasks]; body=made; }
  else if (/\/api\/tasks\/[^/]+$/.test(url) && method === 'PUT') { const id=url.split('/').pop(); tasks=tasks.map(t=>t.task_id===id?{...t,...req.postDataJSON()}:t); body=tasks.find(t=>t.task_id===id); }
  else if (url.endsWith('/api/scheduled-tasks') && method === 'GET') body = { scheduled_tasks:schedules };
  else if (url.endsWith('/api/scheduled-tasks') && method === 'POST') { const p=req.postDataJSON(); const made={scheduled_task_id:'created-schedule',active:true,...p}; schedules=[made,...schedules]; body=made; }
  else if (/\/api\/scheduled-tasks\/[^/]+$/.test(url) && method === 'PUT') { const id=url.split('/').pop(); schedules=schedules.map(t=>t.scheduled_task_id===id?{...t,...req.postDataJSON()}:t); body=schedules.find(t=>t.scheduled_task_id===id); }
  else if (url.includes('/api/shifts/active')) body = { shifts:[] };
  else if (url.includes('/api/shifts/history')) body = { shifts:[] };
  else if (url.includes('/api/incidents')) body = { incidents:[] };
  else body = {};
  await route.fulfill({ status:200, contentType:'application/json', body:JSON.stringify(body) });
});

await page.goto('http://127.0.0.1:3001/app/today');
await page.getByRole('button',{name:'Tasks',exact:true}).click();
await page.getByText('Assignments at a glance').waitFor();
assert.equal(await page.getByTestId('manager-task-row').count(), 2);
await page.getByPlaceholder('Search title, assignee, or category').fill('move-in');
assert.equal(await page.getByTestId('manager-task-row').count(), 1);
await page.getByPlaceholder('Search title, assignee, or category').fill('');
await page.getByRole('button',{name:'Start',exact:true}).click();
await page.getByRole('button',{name:'Start',exact:true}).waitFor({state:'hidden'});

await page.getByRole('button',{name:'Assign task',exact:true}).last().click();
const dialog = page.getByRole('dialog',{name:'Assign Task'});
await dialog.getByPlaceholder('e.g. Close rooftop pool at 10 PM').fill('Check loading dock');
await dialog.getByRole('button',{name:'Continue'}).click();
await dialog.getByRole('radio',{name:/George Nwachukwu/}).click();
await dialog.getByRole('button',{name:'Dispatch Task'}).click();
await page.getByText(/was assigned/).waitFor();

await page.getByRole('button',{name:'Close panel'}).click();
await page.getByRole('button',{name:'Requests',exact:true}).click();
await page.getByTestId('scheduled-task-row').waitFor();
await page.getByText('2026-10-01 – 2026-12-01').waitFor();
await page.getByRole('button',{name:'Edit',exact:true}).click();
await page.getByText('Edit Preset Request').waitFor();
await page.getByRole('button',{name:'Continue'}).click();
await page.getByPlaceholder('e.g. Lobby round check, Elevator log').fill('Opening lobby and door round');
await page.getByRole('button',{name:'Continue'}).click();
await page.getByLabel('Scheduled Time').fill('06:00');
await page.getByRole('button',{name:'Save Changes'}).click();
await page.getByText('Scheduled task updated.').waitFor();
await page.screenshot({path:'/tmp/manager-scheduled-desktop.png',fullPage:true});

await page.setViewportSize({width:390,height:844});
await page.getByRole('button',{name:'Close panel'}).click();
await page.getByRole('button',{name:'Open navigation menu'}).click();
const mobileNav = page.getByRole('dialog',{name:'Manager workspace navigation'});
await mobileNav.getByRole('button',{name:'Tasks',exact:true}).click();
await mobileNav.waitFor({state:'hidden'});
await page.getByText('Assignments at a glance').waitFor();
assert.equal(await page.getByLabel('Task filters').evaluate(el => getComputedStyle(el).gridTemplateColumns), '358px');
assert.deepEqual(errors, [], errors.join('\n'));
await page.screenshot({path:'/tmp/manager-tasks-mobile.png',fullPage:true});
console.log('manager task flows smoke test passed');
await browser.close();
