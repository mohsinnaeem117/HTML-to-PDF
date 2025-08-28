// services/pdfService.js
const puppeteer = require("puppeteer");

let browserPromise = null;

async function getBrowser() {
  if (!browserPromise) {
    browserPromise = puppeteer.launch({
      headless: "new",
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
    });
  }
  return browserPromise;
}

async function generatePdf(htmlContent, options = {}) {
  const browser = await getBrowser();
  const page = await (await browser).newPage();

  try {
    await page.setViewport({
      width: options.width || 1200,
      height: options.height || 800,
    });

    // 🔑 Inject fix styles (SVG + background + page size)
    const patchedHtml = `
      <style>
        body {
          margin: 0;
          background: ${options.bgColor || "white"} !important;
        }
        svg {
          max-width: 100%;
          height: auto;
        }
        @page {
          size: ${options.pageSize || "A4"};
          margin: ${options.margin || 15}mm;
        }
      </style>
      ${htmlContent}
    `;

    await page.setContent(patchedHtml, {
      waitUntil: ["domcontentloaded", "networkidle0"],
      timeout: 30000,
    });

    const pdfBuffer = await page.pdf({
      format: options.pageSize || "A4",
      landscape: options.orientation === "landscape",
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: `${options.margin || 15}mm`,
        right: `${options.margin || 15}mm`,
        bottom: `${options.margin || 15}mm`,
        left: `${options.margin || 15}mm`,
      },
    });

    return pdfBuffer;
  } finally {
    try {
      await page.close();
    } catch (e) {
      console.warn("⚠️ Page close failed:", e.message);
    }
  }
}

// graceful shutdown

process.on("SIGINT", async () => {
  if (browserPromise) {
    const b = await browserPromise;
    await b.close().catch(() => {});
  }
  process.exit(0);
});

module.exports = { generatePdf };
