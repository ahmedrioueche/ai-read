import { isTitleEnd } from "@/utils/helper";
import { useState } from "react";

const useSection = (
  getVisibleText: () => Promise<{ text: string; elements: HTMLElement[] }>,
  getRemainingFullText: (visibleText: string, fullText: string) => string,
  fullText: string
) => {
  const [sectionText, setSectionText] = useState<string>("");

  const findTitleBoundaries = (text: string): number[] => {
    const boundaries: number[] = [];
    // Scan text in 50-character increments for efficiency
    for (let i = 0; i < text.length; i += 50) {
      const chunkEnd = Math.min(i + 100, text.length);
      for (let j = i; j < chunkEnd; j++) {
        if (isTitleEnd(text, j)) {
          boundaries.push(j);
          // Skip ahead to avoid overlapping titles
          i = j;
          break;
        }
      }
    }
    return boundaries;
  };

  const getSectionText = async () => {
    try {
      const { text: visibleText } = await getVisibleText();
      const remainingText = getRemainingFullText(visibleText, fullText);
      const combinedText = visibleText + remainingText;

      // Find all potential title boundaries
      const titleBoundaries = findTitleBoundaries(combinedText);

      // Find the first title boundary that exists in visible text
      const firstVisibleBoundary = titleBoundaries.find(
        (b) => b < visibleText.length
      );

      if (!firstVisibleBoundary) {
        setSectionText(visibleText);
        return;
      }

      // Find the next boundary after the first one
      const nextBoundary =
        titleBoundaries.find((b) => b > firstVisibleBoundary) ||
        combinedText.length;

      // Extract section content with title awareness
      let sectionStart = 0;
      let sectionEnd = nextBoundary;

      // Walk backwards to find actual title start
      for (let i = firstVisibleBoundary; i >= 0; i--) {
        if (
          combinedText[i] === "\n" ||
          (i > 0 && combinedText[i - 1] === " " && combinedText[i] === " ")
        ) {
          sectionStart = i + 1;
          break;
        }
      }

      const sectionContent = combinedText
        .slice(sectionStart, sectionEnd)
        .replace(/\n{3,}/g, "\n\n") // Normalize spacing
        .trim();

      setSectionText(sectionContent);
    } catch (error) {
      console.error("Error extracting section:", error);
      setSectionText("");
    }
  };

  return { sectionText, getSectionText };
};

export default useSection;
