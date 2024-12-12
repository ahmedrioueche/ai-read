"use client";
import { AiApi } from "@/apis/aiApi";
import { formatLanguage } from "@/utils/helper";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { franc } from "franc-min";
import pdfToText from "react-pdftotext";
import { useState, useEffect, useCallback, useRef } from "react";
import TextCard from "./ui/TextCard";
import OptionsMenu from "./ui/OptionsMenu";
import { pageNavigationPlugin } from "@react-pdf-viewer/page-navigation";

const Main = ({ url }: { url: string }) => {
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [translation, setTranslation] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [bookContext, setBookContext] = useState<string | null>(null);
  const [bookLanguage, setBookLanguage] = useState<string | null>(null);
  const [readingSpeed, setReadingSpeed] = useState<number>(0.9);
  const [isReading, setIsReading] = useState(false);
  const settingsData = JSON.parse(localStorage.getItem("settings") || "{}");
  const viewerRef = useRef<any>(null);
  const [lastPage, setLastPage] = useState<number>();
  const [selectionTimeout, setSelectionTimeout] =
    useState<NodeJS.Timeout | null>(null);
  const languageData = settingsData?.languageData;
  const language = languageData.language || "English";
  const aiApi = new AiApi();
  const pageNavigationPluginInstance = pageNavigationPlugin();
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  useEffect(() => {
    const storedLastPage = localStorage.getItem("lastPage");
    if (storedLastPage) {
      const page = parseInt(storedLastPage, 10);
      if (!isNaN(page)) {
        setLastPage(page);
      }
    }
  }, []);

  const handlePageChange = (e: any) => {
    const newPage = e.currentPage;
    localStorage.setItem("lastPage", newPage.toString());
  };

  useEffect(() => {
    if (settingsData) {
      switch (settingsData.readingSpeed) {
        case "normal":
          setReadingSpeed(0.9);
          break;
        case "slow":
          setReadingSpeed(0.7);
          break;
        case "fast":
          setReadingSpeed(1.2);
          break;
      }
    }
  }, [settingsData]);

  const extractText = async (fileUrl: string) => {
    try {
      // Fetch the entire PDF file
      const response = await fetch(fileUrl);
      const fileBlob = await response.blob();

      const text = await pdfToText(fileBlob);

      const limitedText = text.slice(0, 5000);

      setBookContext(limitedText);

      const detectedLanguage = franc(limitedText);

      // Set the detected language
      setBookLanguage(detectedLanguage);
    } catch (error) {
      console.error("Failed to extract text from PDF:", error);
    }
  };

  useEffect(() => {
    if (url) {
      extractText(url);
    }
  }, [url]);

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

  // Function to preprocess the selected text (remove unnecessary line breaks)
  const preprocessText = (text: string) => {
    // Replace multiple spaces or line breaks with a single space
    const cleanedText = text.replace(/\s+/g, " ").trim();
    return cleanedText;
  };

  // Function to convert text to speech
  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      let lang = formatLanguage(bookLanguage);

      utterance.lang = lang;
      utterance.pitch = 1.1; // Set pitch (range 0 to 2)
      utterance.rate = readingSpeed; // Set rate (range 0.1 to 10)

      utterance.onstart = () => {
        setIsReading(true);
      };

      utterance.onend = () => {
        setIsReading(false);
        setSelectedText(null);
      };

      // Speak the text
      window.speechSynthesis.speak(utterance);
    } else {
      console.error("Speech synthesis is not supported in this browser.");
    }
  };

  useEffect(() => {
    const getTranslation = async (text: string) => {
      if (selectedText && selectedText.trim() !== "") {
        const response = await aiApi.getTranslation(text, language);
        if (response) {
          setTranslation(response);
          //setTimeout(() => {
          //  setTranslation(null);
          //  //if reading is disabled, then remove the selected text,
          //  //but if it is not, check if it still reading first
          //  if (settingsData.reading && !isReading) {
          //    setSelectedText(null);
          //  } else if (!settingsData.reading) {
          //    setSelectedText(null);
          //  }
          //}, 10000 + response.length * 500);
        }
      }
    };
    if (selectedText && selectedText.trim() !== "") {
      const preprocessedText = preprocessText(selectedText);
      if (settingsData && settingsData.reading) {
        speakText(preprocessedText);
      }
      if (settingsData && settingsData.translation) {
        getTranslation(preprocessedText);
      }
    }
  }, [selectedText]);

  const getSummary = async () => {
    if (selectedText && selectedText.trim() !== "") {
      const preprocessedText = preprocessText(selectedText);
      const response = await aiApi.getSummary(preprocessedText, language);
      if (response) {
        setSummary(response);
        setTimeout(() => {
          setSummary(null);
        }, response.length * 300);
      }
    }
  };

  const getExplanation = async () => {
    if (selectedText && selectedText.trim() !== "") {
      const preprocessedText = preprocessText(selectedText);
      const response = await aiApi.getExplantion(
        preprocessedText,
        language,
        bookContext!
      );
      if (response) {
        setExplanation(response);
        setTimeout(() => {
          setExplanation(null);
        }, response.length * 300);
      }
    }
  };

  const stopReading = () => {
    // Stop the speech synthesis manually
    window.speechSynthesis.cancel();
    setIsReading(false);
  };

  return (
    <div
      className="h-screen w-screen bg-gray-100 relative"
      style={{ touchAction: "none" }}
    >
      <Worker workerUrl="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js">
        <Viewer
          fileUrl={url}
          plugins={[defaultLayoutPluginInstance]}
          initialPage={lastPage}
          onPageChange={handlePageChange}
          ref={viewerRef}
        />
      </Worker>

      <OptionsMenu
        selectedText={selectedText}
        getExplanation={getExplanation}
        getSummary={getSummary}
        stopReading={stopReading}
        isReading={isReading}
      />

      {translation && (
        <div className="absolute bottom-1/4 left-10 z-10 sm:left-1/2 sm:transform sm:-translate-x-1/2 sm:-translate-y-0 md:bottom-1/4">
          <TextCard
            text={translation}
            type="translation"
            languageData={languageData}
            onClose={() => setTranslation(null)}
          />
        </div>
      )}

      {explanation && (
        <div className="absolute bottom-1/4 left-10 z-10 sm:left-1/2 sm:transform sm:-translate-x-1/2 sm:-translate-y-0 md:bottom-1/4">
          <TextCard
            text={explanation}
            type="explanation"
            languageData={languageData}
            onClose={() => setExplanation(null)}
          />
        </div>
      )}

      {summary && (
        <div className="absolute bottom-1/4 left-10 z-10 sm:left-1/2 sm:transform sm:-translate-x-1/2 sm:-translate-y-0 md:bottom-1/4">
          <TextCard
            text={summary}
            type="summary"
            languageData={languageData}
            onClose={() => setSummary(null)}
          />
        </div>
      )}
    </div>
  );
};

export default Main;
