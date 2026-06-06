const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('LOG:', msg.text()));
    page.on('pageerror', err => console.log('ERROR:', err.message));
    page.on('response', response => {
      if (response.status() >= 400) {
        console.log(`Failed Request: ${response.status()} ${response.url()}`);
      }
    });

    console.log("Navigating to http://localhost:5173");
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
    console.log("Done.");
    await browser.close();
  } catch (err) {
    console.error(err);
  }
})();
