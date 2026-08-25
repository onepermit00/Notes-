const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(800);
  await page.click('text=Sign In');
  await page.waitForTimeout(400);
  const emailInput = await page.$('input[type="email"], input[placeholder*="you@"]');
  if (emailInput) await emailInput.fill('test@test.com');
  const passInput = await page.$('input[type="password"]');
  if (passInput) await passInput.fill('password');
  for (const b of await page.$$('button')) {
    const t = await b.innerText().catch(()=>'');
    const box = await b.boundingBox();
    if (t.toUpperCase().includes('SIGN IN') && box && box.width > 200) { await b.click(); break; }
  }
  await page.waitForTimeout(1200);

  // Open Incident tab
  for (const b of await page.$$('button')) {
    const t = await b.innerText().catch(()=>'');
    const box = await b.boundingBox();
    if (box && box.x < 250 && t.trim() === 'Incident') { await b.click(); break; }
  }
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'C:/Users/Property/AppData/Local/Temp/ss_incident_history.png' });

  // Click New Property Incident button
  const newBtn = await page.$('[data-testid="new-incident-btn"]');
  if (newBtn) await newBtn.click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'C:/Users/Property/AppData/Local/Temp/ss_incident_form_step1.png' });

  // Select a type and go to step 2
  const noiseBtn = await page.$('[data-testid="incident-type-noise"]');
  if (noiseBtn) await noiseBtn.click();
  await page.waitForTimeout(300);
  const nextBtn = await page.$('[data-testid="incident-next-btn"]');
  if (nextBtn) await nextBtn.click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'C:/Users/Property/AppData/Local/Temp/ss_incident_form_step2.png' });

  await browser.close();
  console.log('done');
})().catch(e => { console.error(e.message); process.exit(1); });
