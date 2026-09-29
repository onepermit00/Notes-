import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const manager = {
  user_id:'qa-manager', user_type:'manager', name:'Sarah Thompson',
  email:'sarah@example.com', phone:'(215) 555-0100',
  property_name:'The Hannah', job_title:'Property Manager',
};

const analytics = {
  totals:{tasks:148,completed_tasks:132,completion_rate:89,incidents:7,open_incidents:2,shifts:24},
  by_category:[{category:'Resident assistance',count:48},{category:'Delivery',count:36},{category:'Safety / Security',count:12}],
  incidents_by_severity:[{severity:'high',count:2},{severity:'medium',count:3},{severity:'low',count:2}],
  by_concierge:[{name:'George Nwachukwu',count:71},{name:'Maria Santos',count:54}],
  hourly_activity:Array.from({length:24},(_,hour)=>({hour,count:(hour*7)%13})),
};

const payload = url => {
  if (url.endsWith('/api/auth/me')) return manager;
  if (url.includes('/api/analytics')) return analytics;
  if (url.includes('/api/shifts/active')) return {shifts:[]};
  if (url.includes('/api/shifts/history')) return {shifts:[]};
  if (url.includes('/api/manager/concierges')) return {concierges:[]};
  if (url.includes('/api/manager/residents')) return {residents:[]};
  if (url.includes('/api/tasks')) return {tasks:[]};
  if (url.includes('/api/incidents')) return {incidents:[]};
  if (url.includes('/api/scheduled-tasks')) return {scheduled_tasks:[]};
  return {};
};

const browser = await chromium.launch({headless:true});
const errors = [];

for (const theme of ['light','dark']) {
  for (const viewport of [{width:1440,height:1000},{width:1024,height:900},{width:390,height:844}]) {
    const context = await browser.newContext({viewport});
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(`${theme} ${viewport.width}: ${error.message}`));
    await page.addInitScript(selected => localStorage.setItem('noted-theme', selected), theme);
    await page.route('**/api/**', route => route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(payload(route.request().url()))}));
    await page.goto('http://127.0.0.1:3001/app/today');

    const openDestination = async name => {
      if (viewport.width < 768) await page.getByRole('button',{name:'Open navigation menu'}).click();
      await page.getByRole('button',{name,exact:true}).click();
    };

    await openDestination('Analytics');
    await page.getByText('Activity by Category',{exact:true}).waitFor();
    assert.equal(await page.locator('body').evaluate(el => el.scrollWidth <= el.clientWidth), true, `Analytics overflow at ${viewport.width}px ${theme}`);
    await page.getByRole('button',{name:'Close panel'}).click();

    await openDestination('Settings');
    await page.getByText('Property',{exact:true}).waitFor();
    await page.getByText('Appearance',{exact:true}).waitFor();
    await page.getByText('Notifications',{exact:true}).waitFor();
    assert.equal(await page.getByRole('switch',{name:'Dark mode'}).getAttribute('aria-checked'), String(theme === 'dark'));
    assert.equal(await page.locator('body').evaluate(el => el.scrollWidth <= el.clientWidth), true, `Settings overflow at ${viewport.width}px ${theme}`);
    await page.getByRole('button',{name:'Close panel'}).click();

    await openDestination('Emergency Contacts');
    const contacts = page.getByRole('dialog',{name:'Emergency Contacts'});
    await contacts.waitFor();
    await contacts.getByRole('link',{name:/Call Police \/ Fire \/ EMS/}).waitFor();
    assert.equal(await page.locator('body').evaluate(el => el.scrollWidth <= el.clientWidth), true, `Contacts overflow at ${viewport.width}px ${theme}`);
    await page.keyboard.press('Escape');
    await contacts.waitFor({state:'hidden'});

    await page.screenshot({path:`/tmp/manager-redesign-${theme}-${viewport.width}.png`,fullPage:true});
    await context.close();
  }
}

assert.deepEqual(errors, [], errors.join('\n'));
await browser.close();
console.log('manager redesign responsive and theme smoke test passed');
