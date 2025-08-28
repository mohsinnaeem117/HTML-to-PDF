const puppeteer = require("puppeteer");

let browserPromise = null;

async function getBrowser() {
  if (!browserPromise) {
    browserPromise = puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--single-process",
        "--disable-gpu",
      ],
      // executablePath: process.env.CHROME_PATH || undefined, // not usually needed on Railway
    });
  }
  return browserPromise;
}

async function generatePdf(htmlContent, options = {}) {
  const browser = await getBrowser();
  const page = await (await browser).newPage();
  try {
    // optional viewport (helps with layout)
    await page.setViewport({ width: options.width || 1200, height: options.height || 800 });

    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: options.pageSize || "A4",
      landscape: options.orientation === "landscape",
      printBackground: true,
      margin: {
        top: `${options.margin || 15}mm`,
        right: `${options.margin || 15}mm`,
        bottom: `${options.margin || 15}mm`,
        left: `${options.margin || 15}mm`,
      },
    });

    return pdfBuffer;
  } finally {
    // always close the page
    try { await page.close(); } catch (e) { /* ignore */ }
  }
}

// graceful shutdown
process.on("SIGINT", async () => {
  if (browserPromise) {
    const b = await browserPromise;
    await b.close().catch(()=>{});
  }
  process.exit(0);
});

module.exports = { generatePdf };
