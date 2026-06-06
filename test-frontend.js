const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    await page.setViewport({ width: 1280, height: 1024 });
    console.log("Navigating to http://localhost:5174");
    await page.goto('http://localhost:5174', { waitUntil: 'networkidle0' });
    await page.screenshot({ path: 'frontend_fixed.png', fullPage: true });
    
    console.log("Navigating to storefront...");
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
    await page.screenshot({ path: 'storefront_full.png', fullPage: true });

    console.log("Done.");
    await browser.close();
  } catch (err) {
    console.error(err);
  }
})();
