const fs = require("fs");
const { PDFParse } = require("pdf-parse");

const extractPdfText = async (filePath) => {
  try {
    const buffer = fs.readFileSync(filePath);

    const parser = new PDFParse({
      data: buffer,
    });

    const result = await parser.getText();

    await parser.destroy();

    return result.text;
  } catch (error) {
    console.error("PDF text extraction error:", error);
    throw new Error("Unable to extract text from PDF");
  }
};

module.exports = {
  extractPdfText,
};