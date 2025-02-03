"use client";
import { preprocessText } from "@/utils/helper";
import { Viewer, Worker, SpecialZoomLevel } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { zoomPlugin } from "@react-pdf-viewer/zoom";
import "@react-pdf-viewer/zoom/lib/styles/index.css";
import { useState, useEffect, useRef, FormEvent } from "react";
import TextCard from "./ui/TextCard";
import OptionsMenu from "./ui/OptionsMenu";
import { BookData } from "@/components/Home";
import MinimalCard from "./ui/MinimalCard";
import { useSettings } from "@/context/SettingsContext";
import useBook from "@/hooks/useBook";
import useReading from "@/hooks/useReading";
import useScrolling from "@/hooks/useScrolling";
import useHighlighting from "@/hooks/useHighlighting";
import useTextProcessing from "@/hooks/useTextProcessing";
import { ZoomIn, ZoomOut } from "lucide-react";
import { pageNavigationPlugin } from "@react-pdf-viewer/page-navigation";
import useSection from "@/hooks/useSection";

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
  const [currentBookId, setCurrentBookId] = useState("");
  const [isHoveredOver, setIsHoveredOver] = useState(false);
  const [savedSelectedText, setSavedSelectedText] = useState("");
  const { settings } = useSettings();
  const translationLanguageData = settings.translationLanguage;
  const viewerRef = useRef<any>(null);
  const [lastPage, setLastPage] = useState<number>();
  const bookUrl = book?.fileUrl;
  const [scrollY, setScrollY] = useState(0);
  const [isHighlighting, setIsHighlighting] = useState(false);
  const SCROLL_INTERVAL = 5250;
  const [enableAutoScrolling, setEnableAutoScrolling] = useState(false);
  const [enableHighlighting, setEnableHighlighting] = useState(false);
  const [activeHighlightElements, setActiveHighlightElements] = useState<
    HTMLElement[]
  >([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number | SpecialZoomLevel>(
    SpecialZoomLevel.ActualSize
  );
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [isControlsVisible, setIsControlsVisible] = useState(false); // State for controls visibility

  // Create the zoom plugin instance
  const zoomPluginInstance = zoomPlugin();
  const { zoomTo } = zoomPluginInstance;
  const pageNavigationPluginInstance = pageNavigationPlugin();
  const { jumpToPage } = pageNavigationPluginInstance;

  const {
    selectedText,
    setSelectedText,
    fullText,
    rootRef,
    extractText,
    getVisibleText,
    getRemainingFullText,
    bookContext,
  } = useBook(bookUrl, isFullScreen);

  const {
    translation,
    explanation,
    summary,
    setTranslation,
    setSummary,
    setExplanation,
    getTranslation,
    getSummary,
    getExplanation,
    isValidText,
  } = useTextProcessing(bookContext, isHoveredOver);

  const {
    readingState,
    setReadingState,
    autoReading,
    readingSpeed,
    setReadingSpeed,
    handleTextToSpeech,
    stopReading,
    readSelectedText,
  } = useReading();

  const { getSectionText } = useSection(
    getVisibleText,
    getRemainingFullText,
    fullText
  );

  const { startScrolling, stopScrolling, visibleElements } = useScrolling(
    enableAutoScrolling,
    readingSpeed,
    getVisibleText
  );

  const { handleHighlighting, stopHighlighting } = useHighlighting(
    activeHighlightElements,
    isHighlighting,
    setIsHighlighting,
    readingSpeed
  );

  useEffect(() => {
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
    setCurrentPage(newPage);
    onLastPageChange(parseInt(newPage, 10));
  };

  useEffect(() => {
    if (bookUrl) {
      extractText(bookUrl);
    }
  }, [bookUrl]);

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

  useEffect(() => {
    // Check if visibleElements has changed and is not empty
    if (visibleElements.length > 0) {
      // Compare visibleElements and activeHighlightElements based on content
      const hasDifference =
        visibleElements.length !== activeHighlightElements.length ||
        visibleElements.some((el, index) => {
          const existingElement = activeHighlightElements[index];
          return (
            !existingElement ||
            el.textContent !== existingElement.textContent || // Compare text content
            el.getBoundingClientRect().top !==
              existingElement.getBoundingClientRect().top // Compare position
          );
        });

      if (hasDifference) {
        setActiveHighlightElements((prev) => {
          // Combine previous and new elements, removing duplicates based on content
          const combinedElements = [...prev, ...visibleElements];
          const uniqueElements = combinedElements.filter(
            (el, index, self) =>
              index ===
              self.findIndex(
                (e) =>
                  e.textContent === el.textContent && // Compare text content
                  e.getBoundingClientRect().top ===
                    el.getBoundingClientRect().top // Compare position
              )
          );
          return uniqueElements;
        });
      }
    }
  }, [visibleElements]);

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
      startHighlighting();

      // Find remaining text
      const remainingText = getRemainingFullText(text, fullText);
      if (remainingText.trim() !== "") {
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
        setSavedSelectedText(selectedText);
        const preprocessedText = preprocessText(selectedText);
        if (!isValidText(preprocessedText, isSettingsModalOpen)) return;

        if (
          settings &&
          settings.enableReading &&
          !autoReading.isActivated &&
          !autoReading.isReading &&
          readingState !== "reading"
        ) {
          readSelectedText(preprocessedText);
        }
        if (settings && settings.enableTranslation) {
          getTranslation(preprocessedText);
        }
      }

      setSelectedText(null);
    };

    handleSelectedtext();
  }, [selectedText]);

  const handleStopReading = () => {
    stopReading();
    stopHighlighting();
  };

  useEffect(() => {
    if (isHighlighting && readingState === "reading") {
      handleHighlighting();
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

  // useEffect(() => {
  //   const handleScroll = () => {
  //     setScrollY(window.scrollY); // Update the vertical scroll position
  //   };
  //
  //   // Add scroll event listener
  //   window.addEventListener("scroll", handleScroll);
  //
  //   // Cleanup event listener on component unmount
  //   return () => {
  //     window.removeEventListener("scroll", handleScroll);
  //   };
  // }, []);

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

  // Custom zoom and page controls
  const handleZoomIn = () => {
    const newZoomLevel =
      typeof zoomLevel === "number" ? zoomLevel + 0.25 : 1.25;
    zoomTo(newZoomLevel);
    setZoomLevel(newZoomLevel);
  };

  const handleZoomOut = () => {
    const newZoomLevel =
      typeof zoomLevel === "number" ? zoomLevel - 0.25 : 0.75;
    zoomTo(newZoomLevel);
    setZoomLevel(newZoomLevel);
  };

  const handleZoomChange = (newZoom: number | SpecialZoomLevel) => {
    zoomTo(newZoom);
    setZoomLevel(newZoom);
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pageNumber = parseInt(e.target.value, 10);
    if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      if (viewerRef.current) {
        viewerRef.current.jumpToPage(pageNumber);
      }
    }
  };

  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNumber = currentPage;
    jumpToPage(pageNumber);
  };

  const shouldRenderMinimalCard = (text: string) => {
    return text && text?.trim()?.split(" ")?.length < 20;
  };

  return (
    <div
      ref={rootRef}
      className={`h-screen w-screen bg-gray-100 relative ${
        isDarkMode ? `dark-mode-pdf` : ""
      }`}
      style={{ touchAction: "none" }}
    >
      {/* Custom Zoom and Page Controls */}
      <div
        className={`fixed ${
          isDarkMode ? "top-4" : "top-16"
        } left-4 z-50 flex items-center space-x-4 ${
          isDarkMode
            ? "bg-black/90 text-white filter invert hue-rotate-180"
            : "bg-white/90 text-black"
        } backdrop-blur-sm p-2 rounded-lg shadow-lg transition-opacity duration-300 ${
          isControlsVisible ? "opacity-100" : "opacity-0"
        } hover:opacity-100`}
        onMouseEnter={() => setIsControlsVisible(true)}
        onMouseLeave={() => setIsControlsVisible(false)}
        onClick={() => setIsControlsVisible(!isControlsVisible)}
      >
        <button
          onClick={handleZoomOut}
          className={`p-2 ${
            isDarkMode
              ? "bg-gray-700 hover:bg-gray-600 filter invert hue-rotate-180"
              : "bg-gray-200 hover:bg-gray-300"
          } rounded-full transition-colors`}
        >
          <ZoomOut size={16} />
        </button>
        <select
          value={zoomLevel}
          onChange={(e) =>
            handleZoomChange(
              parseFloat(e.target.value) as unknown as SpecialZoomLevel
            )
          }
          className={`p-2 ${
            isDarkMode
              ? "bg-gray-700 text-white filter invert hue-rotate-180"
              : "bg-gray-200 text-black"
          } rounded-lg`}
        >
          <option value={SpecialZoomLevel.ActualSize}>100%</option>
          <option value={SpecialZoomLevel.PageFit}>Fit Page</option>
          <option value={SpecialZoomLevel.PageWidth}>Fit Width</option>
          <option value={1.5}>150%</option>
          <option value={2}>200%</option>
          <option value={3}>300%</option>
          <option value={4}>400%</option>
        </select>
        <button
          onClick={handleZoomIn}
          className={`p-2 ${
            isDarkMode
              ? "bg-gray-700 hover:bg-gray-600"
              : "bg-gray-200 hover:bg-gray-300"
          } rounded-full transition-colors`}
        >
          <ZoomIn size={16} />
        </button>
        <form
          onSubmit={(e) => handlePageInputSubmit(e)}
          className="flex items-center space-x-2"
        >
          <input
            type="number"
            onChange={handlePageInputChange}
            value={currentPage}
            min={1}
            max={totalPages}
            className={`w-12 p-2 ${
              isDarkMode ? "bg-gray-700 text-white" : "bg-gray-200 text-black"
            } rounded-lg text-center`}
          />
          <span className={isDarkMode ? "text-white" : "text-black"}>
            / {totalPages}
          </span>
        </form>
      </div>

      <Worker workerUrl="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js">
        <Viewer
          fileUrl={bookUrl}
          initialPage={lastPage}
          onPageChange={handlePageChange}
          onDocumentLoad={(e) => setTotalPages(e.doc.numPages)}
          ref={viewerRef}
          defaultScale={zoomLevel}
          plugins={[zoomPluginInstance, pageNavigationPluginInstance]}
        />
      </Worker>
      {/*
        <PageOptionsMenu
          sectionText={selectedText || savedSelectedText}
          getExplanation={() =>
            getExplanation(selectedText || savedSelectedText)
          }
          getSummary={() => getSummary(selectedText || savedSelectedText)}
          isDarkMode={isDarkMode}
          isFullScreen={isFullScreen}
        />
        */}

      <OptionsMenu
        selectedText={selectedText || savedSelectedText}
        getExplanation={() => getExplanation(selectedText || savedSelectedText)}
        getSummary={() => getSummary(selectedText || savedSelectedText)}
        stopReading={handleStopReading}
        startReading={startReading}
        readingState={readingState}
        isDarkMode={isDarkMode}
        isFullScreen={isFullScreen}
      />

      {translation &&
        (shouldRenderMinimalCard(selectedText!) ||
        shouldRenderMinimalCard(savedSelectedText) ? (
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
            onMouseEnter={() => setIsHoveredOver(true)}
            onMouseLeave={() => setIsHoveredOver(false)}
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
          onMouseEnter={() => setIsHoveredOver(true)}
          onMouseLeave={() => setIsHoveredOver(false)}
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
          onMouseEnter={() => setIsHoveredOver(true)}
          onMouseLeave={() => setIsHoveredOver(false)}
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
