import { useState, useEffect, useRef, useCallback } from "react";
import { franc } from "franc-min";
import pdfToText from "react-pdftotext";
import { useSettings } from "@/context/SettingsContext";
import { Settings } from "lucide-react";
import { formatLanguageToName } from "@/utils/helper";

type SetStateAction<T> = T | ((prevState: T) => T);
type SetHighlightElements = (value: SetStateAction<HTMLElement[]>) => void;

const useBook = (bookUrl: string, isFullScreen: boolean) => {
  const [fullText, setFullText] = useState<string>("");
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [selectionTimeout, setSelectionTimeout] =
    useState<NodeJS.Timeout | null>(null);
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [bookContext, setBookContext] = useState<string | null>(null);
  const { settings, updateSettings } = useSettings();

  // Function to extract text from the PDF
  const extractText = async (fileUrl: string) => {
    try {
      const response = await fetch(fileUrl);
      const fileBlob = await response.blob();
      const text = await pdfToText(fileBlob);
      setFullText(text);

      // Detect language from the first 5000 characters
      const limitedText = text.slice(0, 5000);
      setBookContext(limitedText);

      const detectedLanguage = franc(limitedText);
      const formattedLanguage = formatLanguageToName(detectedLanguage);
      updateSettings({ ...settings, bookLanguage: formattedLanguage });
    } catch (error) {
      console.error("Failed to extract text from PDF:", error);
    }
  };

  const handleTextSelection = useCallback(() => {
    let selection: string | null = null;

    // Check for window selection (works on desktop and mobile)
    if (window.getSelection) {
      const selectedText = window.getSelection();
      selection = selectedText ? selectedText.toString().trim() : null;
    }

    // Fallback for older browsers or additional mobile support
    if (!selection) {
      // Check if there's a current selection in the document
      const activeElement = document.activeElement;
      if (activeElement && "value" in activeElement) {
        const inputElement = activeElement as HTMLInputElement;
        selection = inputElement.value
          .substring(
            inputElement.selectionStart || 0,
            inputElement.selectionEnd || 0
          )
          .trim();
      }
    }

    // Only set a timeout if text is selected and meets minimum length
    if (selection && selection.trim() !== "") {
      // Clear the previous timeout if there is one
      if (selectionTimeout) {
        clearTimeout(selectionTimeout);
      }

      // Set a new timeout to finalize the selected text
      setSelectionTimeout(
        setTimeout(() => {
          // Additional check to ensure the selection is still active
          const currentSelection = window.getSelection();
          const currentSelectedText = currentSelection
            ? currentSelection.toString().trim()
            : null;

          if (currentSelectedText === selection) {
            setSelectedText(selection);
          }
        }, 1000)
      );
    }
  }, [selectionTimeout]);

  useEffect(() => {
    // Desktop events
    document.addEventListener("mouseup", handleTextSelection);
    document.addEventListener("selectionchange", handleTextSelection);

    // Mobile touch events
    document.addEventListener("touchend", handleTextSelection);

    return () => {
      // Cleanup event listeners
      document.removeEventListener("mouseup", handleTextSelection);
      document.removeEventListener("selectionchange", handleTextSelection);
      document.removeEventListener("touchend", handleTextSelection);

      // Clear timeout on cleanup
      if (selectionTimeout) {
        clearTimeout(selectionTimeout);
      }
    };
  }, [handleTextSelection]);

  // Function to get visible text from the PDF viewer
  const getVisibleText = async (): Promise<{
    text: string;
    elements: HTMLElement[];
  }> => {
    if (!rootRef.current) {
      console.log("Root ref is not available");
      return { text: "", elements: [] };
    }

    try {
      const container = rootRef.current.querySelector(".rpv-core__viewer");
      if (!container) {
        console.log("Viewer container not found");
        return { text: "", elements: [] };
      }

      const textLayers = Array.from(
        container.querySelectorAll(".rpv-core__text-layer")
      );
      if (textLayers.length === 0) {
        console.log("No text layers found");
        return { text: "", elements: [] };
      }

      let fullText = "";
      const elementsToHighlight: HTMLElement[] = [];
      const viewportHeight =
        window.innerHeight || document.documentElement.clientHeight;
      const viewportWidth =
        window.innerWidth || document.documentElement.clientWidth;

      for (const layer of textLayers) {
        const layerRect = layer.getBoundingClientRect();
        const isLayerVisible =
          layerRect.top < viewportHeight &&
          layerRect.bottom > 0 &&
          layerRect.left < viewportWidth &&
          layerRect.right > 0;

        if (!isLayerVisible) continue;

        const textElements = Array.from(
          layer.querySelectorAll(".rpv-core__text-layer-text")
        );
        const visibleTexts = textElements
          .map((element) => {
            const rect = element.getBoundingClientRect();
            return {
              element,
              rect,
              isVisible:
                rect.top < viewportHeight &&
                rect.bottom > 0 &&
                rect.left < viewportWidth &&
                rect.right > 0,
            };
          })
          .filter(({ isVisible }) => isVisible)
          .sort((a, b) => a.rect.top - b.rect.top);

        if (visibleTexts.length > 0) {
          for (const { element } of visibleTexts) {
            elementsToHighlight.push(element as HTMLElement);
            const text = element.textContent || "";
            fullText += text + " ";
          }
        }
      }

      const trimmedText = fullText.trim();
      return { text: trimmedText, elements: elementsToHighlight };
    } catch (error) {
      console.error("Error getting visible text:", error);
      return { text: "", elements: [] };
    }
  };

  // Function to find the remaining full text after the visible portion
  const findRemainingFullText = (
    visibleText: string,
    fullText: string
  ): string => {
    const normalizeText = (text: string) => {
      return text
        .trim()
        .replace(/\s+/g, " ")
        .replace(/["""]/g, '"')
        .replace(/['']/g, "'");
    };

    const cleanVisibleText = normalizeText(visibleText);
    const cleanFullText = normalizeText(fullText);

    const lastChunkSize = Math.min(cleanVisibleText.length, 200);
    const lastVisibleChunk = cleanVisibleText.slice(-lastChunkSize);

    if (!lastVisibleChunk) {
      console.error("Could not extract chunk from visible text");
      return fullText;
    }

    const chunkPosition = cleanFullText.indexOf(lastVisibleChunk);
    if (chunkPosition === -1) {
      console.error("Could not find visible chunk in full text");
      return fullText;
    }

    const endPosition = chunkPosition + lastVisibleChunk.length;
    let originalTextPosition = 0;
    let normalizedTextPosition = 0;

    while (
      normalizedTextPosition < endPosition &&
      originalTextPosition < fullText.length
    ) {
      while (
        originalTextPosition < fullText.length &&
        /\s/.test(fullText[originalTextPosition])
      ) {
        originalTextPosition++;
      }
      while (
        normalizedTextPosition < cleanFullText.length &&
        /\s/.test(cleanFullText[normalizedTextPosition])
      ) {
        normalizedTextPosition++;
      }
      if (normalizedTextPosition < endPosition) {
        originalTextPosition++;
        normalizedTextPosition++;
      }
    }

    return fullText.slice(originalTextPosition).trim();
  };

  const getTopOffset = () => {
    return isFullScreen ? 60 : 120 - scrollY;
  };

  // Extract text when the book URL changes
  useEffect(() => {
    if (bookUrl) {
      extractText(bookUrl);
    }
  }, [bookUrl]);

  return {
    fullText,
    selectedText,
    setSelectedText,
    rootRef,
    extractText,
    getVisibleText,
    findRemainingFullText,
    handleTextSelection,
    bookContext,
    setBookContext,
  };
};

export default useBook;
