// services/pdfService.js
const puppeteer = require("puppeteer");
async function launchBrowser() {
  return puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--disable-gpu",
      "--disable-software-rasterizer",
    ],
  });
}
async function generatePdf(htmlContent, options = {}) {
  let browser;
  let page;
  try {
    browser = await launchBrowser();
    page = await browser.newPage();
    await page.setViewport({
      width: options.width || 1200,
      height: options.height || 800,
    });
    // 🔑 Inject global styles (fix background, SVG scaling, margins)
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
        img {
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
    if (page) {
      try {
        await page.close();
      } catch (e) {
        console.warn("⚠️ Page close failed:", e.message);
      }
    }
    if (browser) {
      try {
        await browser.close();
      } catch (e) {
        console.warn("⚠️ Browser close failed:", e.message);
      }
    }
  }
}
module.exports = { generatePdf };
Collapse









