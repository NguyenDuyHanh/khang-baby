const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    // Log console messages
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    
    // Test front-end
    console.log("Navigating to front-end...");
    const responseFront = await page.goto('http://localhost:5174', { waitUntil: 'networkidle2' });
    console.log("Front-end Status:", responseFront.status());
    await page.screenshot({ path: 'frontend.png' });
    
    // Test storefront
    console.log("\nNavigating to storefront...");
    const responseStore = await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
    console.log("Storefront Status:", responseStore.status());
    await page.screenshot({ path: 'storefront.png' });
    
    await browser.close();
  } catch (err) {
    console.error(err);
  }
})();
