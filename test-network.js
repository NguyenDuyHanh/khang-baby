const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    page.on('response', response => {
      const status = response.status();
      if (status >= 400) {
        console.log(`HTTP ${status} on ${response.url()}`);
      }
    });

    console.log("Navigating to storefront...");
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
    
    console.log("Done checking storefront.");
    
    await browser.close();
  } catch (err) {
    console.error(err);
  }
})();
