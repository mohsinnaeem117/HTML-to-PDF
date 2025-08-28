const express = require("express");
const cors = require("cors");
const pdfController = require("./controllers/pdfController");

const app = express();
const port = process.env.PORT || 5000;

// allow bigger payloads (HTML can be large)
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.get("/", (req, res) => res.send("Puppeteer PDF service running"));
app.post("/generate-pdf", pdfController.generatePdf);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
