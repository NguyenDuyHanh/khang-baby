const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    console.log("Navigating to http://localhost:5173");
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
    await page.screenshot({ path: 'storefront_fixed.png' });
    console.log("Screenshot saved.");
    await browser.close();
  } catch (err) {
    console.error(err);
  }
})();
