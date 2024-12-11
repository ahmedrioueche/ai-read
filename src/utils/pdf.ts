import { pdfjs } from "react-pdf";

// Set the worker source for pdf.js
pdfjs.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.js";

// Define a function to extract text from the first few pages of the PDF
export const extractTextFromFirstPages = async (
  url: string
): Promise<string> => {
  const pdf = await pdfjs.getDocument(url).promise;
  const numPages = pdf.numPages;
  let text = "";

  // Extract text from the first few pages (e.g., first 3 pages)
  for (let i = 1; i <= Math.min(3, numPages); i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();

    // Ensure that we handle the correct type and extract the 'str' property from TextItem
    const pageText = content.items
      .map((item) => {
        if ((item as { str: string }).str) {
          return (item as { str: string }).str;
        }
        return ""; // In case of TextMarkedContent, return empty string
      })
      .join(" ");

    text += pageText + " ";
  }

  return text;
};
