import vol1CPdf from "./real_books/vol1-5th-c.pdf";
import vol1bassPdf from "./real_books/vol1-5th-bass.pdf";
import vol1BbCPdf from "./real_books/vol1-5th-bb.pdf";
import vol1EbPdf from "./real_books/vol1-5th-eb.pdf";

import vol2CPdf from "./real_books/vol2-5th-c.pdf";
import vol2bassPdf from "./real_books/vol2-5th-bass.pdf";
import vol2BbCPdf from "./real_books/vol2-5th-bb.pdf";
import vol2EbPdf from "./real_books/vol2-5th-eb.pdf";

import vol3CPdf from "./real_books/vol3-5th-c.pdf";
import vol3BbPdf from "./real_books/vol3-5th-bb.pdf";

const pdfMapping = {
  "vol1-5th": {
    c: vol1CPdf,
    bass: vol1bassPdf,
    bb: vol1BbCPdf,
    eb: vol1EbPdf,
  },
  "vol2-5th": {
    c: vol2CPdf,
    bass: vol2bassPdf,
    bb: vol2BbCPdf,
    eb: vol2EbPdf,
  },
  "vol3-5th": {
    c: vol3CPdf,
    bb: vol3BbPdf,
  },
};

export default pdfMapping;
