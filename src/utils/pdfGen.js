import puppeteer from 'puppeteer';

export async function generatePdf(html, outputPath) {
  let browser;
  try {
    // Launch the browser once
    browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    
    // Use 'domcontentloaded' if your HTML has no external network requests (images, scripts)
    await page.setContent(html, { waitUntil: 'domcontentloaded' });

    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
    });
    console.log(`PDF successfully saved to ${outputPath}`);
    
  } catch (error) {
    console.error('An error occurred during PDF generation:', error);
    // Re-throw the error so the caller knows something went wrong
    throw error;
  } finally {
    // Ensure the browser is closed, even if an error occurred
    if (browser) {
      await browser.close();
    }
  }
}