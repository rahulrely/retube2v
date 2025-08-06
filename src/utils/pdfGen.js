import chromium from 'chrome-aws-lambda';

export async function generatePdf(html, outputPath) {
  let browser;
  try {
    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath || undefined,
      headless: chromium.headless,
      defaultViewport: chromium.defaultViewport,
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'domcontentloaded' });

    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
    });

    console.log(`PDF successfully saved to ${outputPath}`);
  } catch (error) {
    console.error('An error occurred during PDF generation:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}