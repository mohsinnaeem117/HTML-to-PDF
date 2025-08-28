// controllers/pdfController.js
const pdfService = require("../services/pdfService");

const generatePdf = async (req, res) => {
  try {
    const { htmlContent, options = {} } = req.body;

    // ✅ Validation
    if (!htmlContent) {
      return res.status(400).json({ error: "HTML content is required" });
    }

    // ✅ Generate PDF buffer from service
    const pdfBuffer = await pdfService.generatePdf(htmlContent, options);

    // ✅ Agar base64 chahiye (Bubble.io or APIs ke liye useful)
    if (options.asBase64) {
      return res.json({
        filename: options.filename || "document.pdf",
        data: pdfBuffer.toString("base64"),
      });
    }

    // ✅ Warna direct PDF response bhejo
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${options.filename || "document.pdf"}"`
    );

    return res.send(pdfBuffer);
  } catch (error) {
    console.error("❌ PDF generation error:", error);
    return res.status(500).json({ error: "Failed to generate PDF" });
  }
};

module.exports = { generatePdf };
