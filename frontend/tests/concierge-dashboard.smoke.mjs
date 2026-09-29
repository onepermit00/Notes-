import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const concierge = {
  user_id:'qa-concierge', user_type:'concierge', name:'George Nwachukwu',
  email:'george@example.com', phone:'(404) 555-0125', property_name:'The Hannah',
};
const scheduledTasks = [
  { task_id:'close-gym', title:'Close gym', notes:'Lock doors and turn off lights.', due_time:'22:00', status:'pending', created_by_type:'manager', source_section:'scheduled' },
  { task_id:'open-gym', title:'Open gym', notes:'Unlock doors and complete opening check.', due_time:'06:00', status:'pending', created_by_type:'manager', source_section:'scheduled' },
];

const payload = url => {
  if (url.endsWith('/api/auth/me')) return concierge;
  if (url.includes('/api/shifts/active')) return { shifts:[] };
  if (url.includes('/api/shifts/history')) return { shifts:[] };
  if (url.includes('/api/manager/concierges')) return [];
  if (url.includes('/api/tasks')) return { tasks:scheduledTasks };
  if (url.includes('/api/incidents')) return [];
  return {};
};

const browser = await chromium.launch({ headless:true });
const context = await browser.newContext({ viewport:{ width:1440, height:1000 } });
const page = await context.newPage();
const runtimeErrors = [];
page.on('pageerror', error => runtimeErrors.push(error.message));
await page.route('**/api/**', route => route.fulfill({ status:200, contentType:'application/json', body:JSON.stringify(payload(route.request().url())) }));

await page.goto('http://localhost:3001/app/today');
await page.getByRole('button', { name:"Today's", exact:true }).click();
await page.getByText('Concierge desk', { exact:true }).waitFor();
await page.waitForFunction(() => document.querySelector('aside[aria-label="Concierge workspace navigation"]')?.getBoundingClientRect().width === 272);
assert.equal(await page.locator('aside[aria-label="Concierge workspace navigation"]').evaluate(el => el.getBoundingClientRect().width), 272);
await page.getByRole('button', { name:'Collapse sidebar' }).click();
await page.waitForFunction(() => document.querySelector('aside[aria-label="Concierge workspace navigation"]')?.getBoundingClientRect().width === 80);
assert.equal(await page.locator('aside[aria-label="Concierge workspace navigation"]').evaluate(el => el.getBoundingClientRect().width), 80);
await page.screenshot({ path:'/tmp/concierge-dashboard-light.png', fullPage:true });

await page.evaluate(() => localStorage.setItem('noted-theme', 'dark'));
await page.reload();
await page.getByRole('button', { name:"Today's", exact:true }).waitFor();
await page.screenshot({ path:'/tmp/concierge-dashboard-dark.png', fullPage:true });

await page.setViewportSize({ width:390, height:844 });
await page.getByRole('button', { name:'Open navigation menu' }).click();
await page.getByRole('button', { name:'Close navigation menu' }).waitFor();
await page.getByRole('button', { name:'Settings', exact:true }).click();
await page.getByRole('button', { name:'Close panel' }).waitFor();
await page.getByRole('button', { name:'Close panel' }).click();
await page.screenshot({ path:'/tmp/concierge-dashboard-mobile.png', fullPage:true });

await page.goto('http://localhost:3001/app/tasks');
const requestTitles = await page.locator('article h3').allTextContents();
assert.deepEqual(requestTitles, ['Open gym', 'Close gym']);
await page.getByText('Unlock doors and complete opening check.').waitFor();
await page.getByText('Upcoming', { exact:true }).first().waitFor();

assert.deepEqual(runtimeErrors, [], `concierge runtime errors: ${runtimeErrors.join('\n')}`);
console.log('concierge dashboard smoke test passed');
await browser.close();
