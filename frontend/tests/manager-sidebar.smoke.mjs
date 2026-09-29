import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const manager = {
  user_id: 'qa-manager', user_type: 'manager', name: 'Sarah Thompson',
  email: 'sarah@example.com', phone: '(404) 555-0123',
  property_name: 'The Hannah', job_title: 'Property Manager',
};

const emptyPayload = (url, user = manager) => {
  if (url.endsWith('/api/auth/me')) return user;
  if (url.includes('/api/shifts/active')) return { shift:null };
  if (url.includes('/api/shifts/history')) return { shifts:[] };
  if (url.includes('/api/manager/concierges')) return [];
  if (url.includes('/api/manager/residents')) return [];
  if (url.includes('/api/tasks')) return [];
  if (url.includes('/api/incidents')) return [];
  if (url.includes('/api/scheduled-tasks')) return [];
  if (url.includes('/api/analytics')) return {
    totals:{ tasks:0, shifts:0, incidents:0 }, by_category:[],
    incidents_by_severity:[], by_concierge:[], hourly_activity:[],
  };
  return {};
};

const browser = await chromium.launch({ headless:true });
const context = await browser.newContext({ viewport:{ width:1440, height:1000 } });
const page = await context.newPage();
const runtimeErrors = [];
page.on('pageerror', error => runtimeErrors.push(error.message));
await page.route('**/api/**', route => route.fulfill({ status:200, contentType:'application/json', body:JSON.stringify(emptyPayload(route.request().url())) }));
await page.goto('http://localhost:3001/app/today');
await page.getByRole('button', { name:'Overview', exact:true }).click();
await page.getByText('Manager desk', { exact:true }).waitFor();
await page.waitForTimeout(250);
const desktopSidebar = page.locator('aside[aria-label="Manager workspace navigation"]');
assert.equal(Math.round((await desktopSidebar.boundingBox()).width), 272);
await page.getByRole('textbox', { name:'Search residents, tasks, shifts, incidents' }).focus();
await page.getByRole('button', { name:'✕ Close' }).waitFor();
await page.getByRole('button', { name:'✕ Close' }).click();
await page.getByRole('button', { name:'View notifications' }).click();
await page.getByRole('button', { name:'Switch to dark mode' }).click();
await page.getByRole('button', { name:'Switch to light mode' }).click();

const destinations = ['Tasks', 'Shifts', 'Team', 'Residents', 'Scheduled Tasks', 'Shift Sections', 'SOPs', 'Training', 'Analytics', 'Settings'];
for (const label of destinations) {
  console.log('checking', label);
  await page.getByRole('button', { name:label, exact:true }).click();
  const closePanel = page.getByRole('button', { name:'Close panel' });
  await closePanel.waitFor();
  await closePanel.click();
  await closePanel.waitFor({ state:'hidden' });
}

await page.getByRole('button', { name:'Assign Task', exact:true }).click();
await page.getByRole('dialog', { name:'Assign Task' }).waitFor();
await page.keyboard.press('Escape');
await page.getByRole('button', { name:'Emergency Contacts', exact:true }).click();
await page.getByText('Emergency Contacts', { exact:true }).last().waitFor();
await page.keyboard.press('Escape');

await page.getByRole('button', { name:'Collapse sidebar' }).click();
await page.waitForTimeout(250);
assert.equal(Math.round((await desktopSidebar.boundingBox()).width), 80);
assert.equal(await page.getByRole('button', { name:'Overview', exact:true }).getAttribute('title'), 'Overview');
await page.getByRole('button', { name:'Overview', exact:true }).click();
await page.getByText('Manager desk', { exact:true }).waitFor();
await page.waitForTimeout(250);
await page.screenshot({ path:'/tmp/manager-dashboard-desktop.png', fullPage:true });

await page.setViewportSize({ width:390, height:844 });
await page.getByRole('button', { name:'Open navigation menu' }).click();
const mobileDrawer = page.getByRole('dialog', { name:'Manager workspace navigation' });
await mobileDrawer.waitFor();
await page.waitForTimeout(350);
assert.equal(Math.round((await mobileDrawer.boundingBox()).width), 272);
await page.getByRole('button', { name:'Team', exact:true }).click();
await page.getByRole('button', { name:'Close panel' }).waitFor();
await page.getByRole('button', { name:'Close panel' }).click();
await page.getByRole('button', { name:'Open navigation menu' }).click();
await page.waitForTimeout(350);
await page.screenshot({ path:'/tmp/manager-dashboard-mobile.png', fullPage:true });
await page.getByRole('button', { name:'Emergency Contacts', exact:true }).scrollIntoViewIfNeeded();
await page.getByRole('button', { name:'Settings', exact:true }).waitFor();
await page.getByRole('button', { name:'Close navigation menu' }).click();
await mobileDrawer.waitFor({ state:'hidden' });
assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);

console.log('manager sidebar smoke test passed');
assert.deepEqual(runtimeErrors, [], `manager runtime errors: ${runtimeErrors.join('\n')}`);

const concierge = {
  user_id:'qa-concierge', user_type:'concierge', name:'Jordan Lee',
  email:'jordan@example.com', property_name:'The Hannah', title:'Concierge',
};
const conciergeContext = await browser.newContext({ viewport:{ width:1440, height:1000 } });
const conciergePage = await conciergeContext.newPage();
const conciergeErrors = [];
conciergePage.on('pageerror', error => conciergeErrors.push(error.message));
await conciergePage.route('**/api/**', route => route.fulfill({ status:200, contentType:'application/json', body:JSON.stringify(emptyPayload(route.request().url(), concierge)) }));
await conciergePage.goto('http://localhost:3001/app/today');
await conciergePage.getByRole('button', { name:"Today's", exact:true }).click();
await conciergePage.getByText('Concierge desk', { exact:true }).waitFor();
await conciergePage.getByText('Property operations', { exact:true }).waitFor();
await conciergePage.waitForTimeout(250);
const conciergeSidebar = conciergePage.locator('aside[aria-label="Concierge workspace navigation"]');
assert.equal(Math.round((await conciergeSidebar.boundingBox()).width), 272);
await conciergePage.screenshot({ path:'/tmp/concierge-dashboard-desktop.png', fullPage:true });
await conciergePage.setViewportSize({ width:390, height:844 });
await conciergePage.getByRole('button', { name:'Open navigation menu' }).click();
await conciergePage.getByRole('button', { name:'Close navigation menu' }).waitFor();
await conciergePage.waitForTimeout(350);
await conciergePage.screenshot({ path:'/tmp/concierge-dashboard-mobile.png', fullPage:true });
assert.deepEqual(conciergeErrors, [], `concierge runtime errors: ${conciergeErrors.join('\n')}`);
await conciergeContext.close();
await browser.close();
