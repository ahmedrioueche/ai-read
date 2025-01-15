"use client";
import { preprocessText } from "@/utils/helper";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { useState, useEffect, useRef } from "react";
import TextCard from "./ui/TextCard";
import OptionsMenu from "./ui/OptionsMenu";
import { pageNavigationPlugin } from "@react-pdf-viewer/page-navigation";
import { BookData } from "@/components/Home";
import MinimalCard from "./ui/MinimalCard";
import { useSettings } from "@/context/SettingsContext";
import useBook from "@/hooks/useBook";
import useReading from "@/hooks/useReading";
import useScrolling from "@/hooks/useScrolling";
import useHighlighting from "@/hooks/useHighlighting";
import useTextProcessing from "@/hooks/useTextProcessing";

const Main = ({
  book,
  onLastPageChange,
  isSettingsModalOpen,
  isFullScreen,
}: {
  book: BookData;
  onLastPageChange: (lastPage: number) => void;
  isSettingsModalOpen: boolean;
  isFullScreen: boolean;
}) => {
  const [summary, setSummary] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [currentBookId, setCurrentBookId] = useState("");
  const [isHoverOver, setIsHoverOver] = useState(false);
  const { settings, updateSettings } = useSettings();
  const translationLanguageData = settings.translationLanguage;
  const viewerRef = useRef<any>(null);
  const [lastPage, setLastPage] = useState<number>();
  const pageNavigationPluginInstance = pageNavigationPlugin();
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const bookUrl = book?.fileUrl;
  const [scrollY, setScrollY] = useState(0);
  const [isHighlighting, setIsHighlighting] = useState(false);
  const [scrollIntervalId, setScrollIntervalId] = useState<number>();
  const SCROLL_INTERVAL = 5250;
  const [ttsType, setTtsType] = useState<"premium" | "basic">("basic");
  const [ttsVoice, setTtsVoice] = useState("");
  const [enableAutoScrolling, setEnableAutoScrolling] = useState(false);
  const [enableHighlighting, setEnableHighlighting] = useState(false);
  const [activeHighlightElements, setActiveHighlightElements] = useState<
    HTMLElement[]
  >([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const {
    selectedText,
    fullText,
    rootRef,
    extractText,
    getVisibleText,
    findRemainingFullText,
    findRemainingElements,
    bookContext,
  } = useBook(bookUrl, isFullScreen);

  const {
    translation,
    setTranslation,
    getTranslation,
    getSummary,
    getExplanation,
    isValidText,
  } = useTextProcessing(bookContext, isHoverOver);

  const {
    readingState,
    setReadingState,
    autoReading,
    readingSpeed,
    setReadingSpeed,
    handleTextToSpeech,
    stopReading,
    readSelectedText,
  } = useReading(ttsType, ttsVoice);

  const { startScrolling, stopScrolling } = useScrolling(
    enableAutoScrolling,
    readingSpeed,
    getVisibleText
  );

  const { handleHighlighting, stopHighlighting } = useHighlighting(
    isHighlighting,
    setIsHighlighting,
    activeHighlightElements,
    readingSpeed
  );

  useEffect(() => {
    setTtsType(settings?.ttsType);
    setTtsVoice(settings?.ttsVoice);
    setEnableAutoScrolling(settings?.enableAutoScrolling);
    setEnableHighlighting(settings?.enableHighlighting);
    setIsDarkMode(settings?.theme === "dark" ? true : false);
  }, [settings]);

  useEffect(() => {
    if (book && !currentBookId) {
      setCurrentBookId(book.id);
    }

    if (book?.lastPage) {
      const lastPage = book?.lastPage;
      if (!isNaN(lastPage)) {
        setLastPage(lastPage);
      }
    }

    if (book && book.id !== currentBookId) {
      //a new book was opened
      handleStopReading();
      setCurrentBookId(book.id);
    }
  }, [book]);

  const handlePageChange = (e: any) => {
    const newPage = e.currentPage;
    onLastPageChange(parseInt(newPage, 10));
  };

  useEffect(() => {
    if (bookUrl) {
      extractText(bookUrl);
    }
  }, [bookUrl]);

  // Debug helper
  useEffect(() => {
    if (activeHighlightElements.length > 0) {
      console.log("Active highlight elements:", {
        count: activeHighlightElements.length,
        elements: activeHighlightElements,
        texts: activeHighlightElements.map((el) => el.textContent),
      });
    }
  }, [activeHighlightElements]);

  useEffect(() => {
    if (readingState === "reading") {
      startScrolling(SCROLL_INTERVAL);
    } else {
      stopScrolling();
    }
  }, [readingState]);

  const startHighlighting = () => {
    if (enableHighlighting) {
      setIsHighlighting(true);
    }
  };

  const startReading = async () => {
    setReadingState("loading");
    autoReading.isActivated = true;

    try {
      // Fetch initial visible text and elements
      const { text, elements } = await getVisibleText();

      // Process and handle initial visible text
      const processedText = preprocessText(text);
      await handleTextToSpeech(processedText);
      setActiveHighlightElements(elements);

      // Find remaining text
      const remainingText = findRemainingFullText(text, fullText);

      if (remainingText) {
        // Find the exact position where remaining text starts
        const originalTextPosition = fullText.indexOf(remainingText);
        console.log("originalTextPosition", originalTextPosition);
        // Process remaining elements before handling the remaining text
        await findRemainingElements(
          fullText,
          elements,
          originalTextPosition,
          setActiveHighlightElements
        );

        startHighlighting();

        // Process and speak remaining text
        const processedRemainingText = preprocessText(remainingText);
        await handleTextToSpeech(processedRemainingText);
      }
    } catch (error) {
      console.error("Error in startReading:", error);
      autoReading.isActivated = false;
    }
  };

  useEffect(() => {
    const handleSelectedtext = async () => {
      if (selectedText && selectedText.trim() !== "") {
        const preprocessedText = preprocessText(selectedText);
        if (!isValidText(preprocessedText, isSettingsModalOpen)) return;

        if (settings && settings.enableReading) {
          readSelectedText(preprocessedText);
        }
        if (settings && settings.enableTranslation) {
          getTranslation(preprocessedText);
        }
      }
    };

    handleSelectedtext();
  }, [selectedText]);

  const handleStopReading = () => {
    stopReading();
    stopHighlighting();
  };

  useEffect(() => {
    //console.log("activeHighlightElements", activeHighlightElements);
    if (isHighlighting && readingState === "reading") {
      handleHighlighting(activeHighlightElements);
    } else {
      // Clear any existing highlights when highlighting is turned off
      activeHighlightElements.forEach((el) =>
        el.classList.remove("highlighted-text")
      );
    }
  }, [isHighlighting, activeHighlightElements, readingState]);

  useEffect(() => {
    if (settings) {
      switch (settings.readingSpeed) {
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
  }, [settings]);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY); // Update the vertical scroll position
    };

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      // Stop speech synthesis before the page unloads
      handleStopReading();
    };

    // Add event listener to stop reading on page refresh or navigation
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      // Clean up event listener
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={`h-screen w-screen bg-gray-100 relative ${
        isDarkMode ? `dark-mode-pdf` : ""
      }`}
      style={{ touchAction: "none" }}
    >
      <Worker workerUrl="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js">
        <Viewer
          fileUrl={bookUrl}
          plugins={[defaultLayoutPluginInstance]}
          initialPage={lastPage}
          onPageChange={handlePageChange}
          ref={viewerRef}
        />
      </Worker>

      <OptionsMenu
        selectedText={selectedText}
        getExplanation={() => getExplanation(selectedText!)}
        getSummary={() => getSummary(selectedText!)}
        stopReading={handleStopReading}
        startReading={startReading}
        readingState={readingState}
        isDarkMode={isDarkMode}
      />

      {translation &&
        (selectedText && selectedText?.trim()?.split(" ")?.length < 20 ? (
          <div className="flex justify-center items-center fixed bottom-0 left-1/2 transform -translate-x-1/2 md:w-[80%] w-full z-50">
            <MinimalCard
              text={translation}
              onClose={() => setTranslation(null)}
              viewerRef={viewerRef}
              isDarkMode={isDarkMode}
            />
          </div>
        ) : (
          <div
            className="flex justify-center items-end w-full h-full"
            onMouseEnter={() => setIsHoverOver(true)}
            onMouseLeave={() => setIsHoverOver(false)}
          >
            <TextCard
              text={translation}
              type="translation"
              languageData={translationLanguageData}
              onClose={() => setTranslation(null)}
              isDarkMode={isDarkMode}
            />
          </div>
        ))}

      {explanation && (
        <div
          className="flex justify-center items-end w-full h-full"
          onMouseEnter={() => setIsHoverOver(true)}
          onMouseLeave={() => setIsHoverOver(false)}
        >
          <TextCard
            text={explanation}
            type="explanation"
            languageData={translationLanguageData}
            onClose={() => setExplanation(null)}
            isDarkMode={isDarkMode}
          />
        </div>
      )}

      {summary && (
        <div
          className="flex justify-center items-end w-full h-full"
          onMouseEnter={() => setIsHoverOver(true)}
          onMouseLeave={() => setIsHoverOver(false)}
        >
          <TextCard
            text={summary}
            type="summary"
            languageData={translationLanguageData}
            onClose={() => setSummary(null)}
            isDarkMode={isDarkMode}
          />
        </div>
      )}
    </div>
  );
};

export default Main;
