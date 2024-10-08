import { NextResponse } from "next/server";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import "pdfjs-dist/legacy/build/pdf.worker.mjs"; // Worker file for PDF.js
import { createCanvas } from "canvas"; // Canvas for rendering on the server

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  let pdfUrl = searchParams.get("pdfUrl");
  const pageNumber = parseInt(searchParams.get("page"), 10);

  // Validate parameters
  if (!pdfUrl || isNaN(pageNumber) || pageNumber < 1) {
    return new NextResponse("Invalid parameters", { status: 400 });
  }

  try {
    // Ensure that the origin is obtained correctly and that pdfUrl is a valid URL
    if (pdfUrl.startsWith("/")) {
      const origin = request.headers.get("origin") || "http://localhost:3000";
      pdfUrl = `${origin}${pdfUrl}`;
    }

    // Fetch the PDF
    const pdfBuffer = await fetch(pdfUrl).then((res) => res.arrayBuffer());
    const pdfDocument = await pdfjsLib.getDocument({ data: pdfBuffer }).promise;

    // Get the specific page
    const pdfPage = await pdfDocument.getPage(pageNumber);

    // Set the viewport and scale
    const scale = 1.5;
    const viewport = pdfPage.getViewport({ scale });

    // Create a canvas for rendering
    const canvas = createCanvas(viewport.width, viewport.height);
    const context = canvas.getContext("2d");

    // Render the page into the canvas
    await pdfPage.render({ canvasContext: context, viewport }).promise;

    // Convert the canvas to an image buffer
    const imageBuffer = canvas.toBuffer();

    const headers = {
      "Content-Type": "image/png",
      "Access-Control-Allow-Origin": "*", // Specify allowed origins in production
    };

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: headers,
    });
  } catch (error) {
    console.error("Error processing PDF:", error);
    return new NextResponse(`Error details: ${error.message}`, { status: 500 });
  }
}
