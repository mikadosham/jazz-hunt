import { PDFDocument } from "pdf-lib";
import { getPlaiceholder } from "plaiceholder";

export default async function handler(req, res) {
  const { pdfUrl, page } = req.query;

  try {
    const pdfBuffer = await fetch(pdfUrl).then((res) => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pageNumber = parseInt(page) - 1; // Convert to 0-based index

    const pdfPage = pdfDoc.getPages()[pageNumber];
    const pdfBytes = await pdfPage.saveAsBase64({ dataUri: true });

    // Use sharp or similar library to convert PDF page to image
    const { img } = await getPlaiceholder(pdfBytes);
    res.setHeader("Content-Type", "image/jpeg");
    res.status(200).send(img);
  } catch (error) {
    console.error("Error processing PDF:", error);
    res.status(500).json({ error: "Failed to process PDF" });
  }
}
