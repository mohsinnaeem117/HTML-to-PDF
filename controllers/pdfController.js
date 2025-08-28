const pdfService = require("../services/pdfService");

const generatePdf = async (req, res) => {
  const { htmlContent, options = {} } = req.body;

  if (!htmlContent) return res.status(400).json({ error: "HTML content is required" });

  try {
    const pdfBuffer = await pdfService.generatePdf(htmlContent, options);

    if (options.asBase64) {
      // useful for Bubble if you want JSON with base64 string
      return res.json({
        filename: options.filename || "document.pdf",
        data: pdfBuffer.toString("base64"),
      });
    }

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${options.filename || "document.pdf"}"`,
    });
    res.send(pdfBuffer);
  } catch (error) {
    console.error("PDF generation error:", error);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
};

module.exports = { generatePdf };
