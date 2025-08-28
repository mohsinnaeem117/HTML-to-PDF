// controllers/pdfController.js
const pdfService = require("../services/pdfService");
const generatePdf = async (req, res) => {
  try {
    const { htmlContent, options = {} } = req.body;
    // :white_check_mark: Validate input
    if (!htmlContent) {
      return res.status(400).json({ error: "HTML content is required" });
    }
    // :white_check_mark: Generate PDF
    const pdfBuffer = await pdfService.generatePdf(htmlContent, options);
    // :white_check_mark: Respond with base64 (API usage) or file (download)
    if (options.asBase64) {
      return res.json({
        filename: options.filename || "document.pdf",
        data: pdfBuffer.toString("base64"),
      });
    }
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${options.filename || "document.pdf"}"`
    );
    res.setHeader("Content-Length", pdfBuffer.length);
    return res.end(pdfBuffer); // correct way (not res.send)
  } catch (error) {
    console.error(":x: PDF generation error:", error);
    return res.status(500).json({ error: "Failed to generate PDF" });
  }
};
module.exports = { generatePdf };






