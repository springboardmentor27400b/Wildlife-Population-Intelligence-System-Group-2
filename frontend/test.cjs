const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('requestfailed', request =>
    console.log('REQUEST FAILED:', request.url(), request.failure().errorText)
  );

  try {
    console.log('Navigating to http://localhost:5173/dashboard ...');
    await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle2' });
    console.log('Page loaded');
    
    // Evaluate if there is an error overlay
    const errorOverlay = await page.evaluate(() => {
      const viteError = document.querySelector('vite-error-overlay');
      return viteError ? viteError.shadowRoot.innerHTML : null;
    });
    
    if (errorOverlay) {
        console.log('VITE ERROR OVERLAY:', errorOverlay);
    }
  } catch (err) {
    console.error('Error during navigation:', err);
  } finally {
    await browser.close();
  }
})();
