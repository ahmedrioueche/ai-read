"use client";
import { AiApi } from "@/apis/aiApi";
import { useSettings } from "@/context/SettingsContext";
import useBook from "@/hooks/useBook";
import { BookData } from "@/hooks/useBookManager";
import useHighlighting from "@/hooks/useHighlighting";
import useReading from "@/hooks/useReading";
import useScrolling from "@/hooks/useScrolling";
import useTextProcessing from "@/hooks/useTextProcessing";
import { cancellableDelay, splitTextIntoChunks } from "@/utils/helper";
import { SpecialZoomLevel } from "@react-pdf-viewer/core";
import { pageNavigationPlugin } from "@react-pdf-viewer/page-navigation";
import { zoomPlugin } from "@react-pdf-viewer/zoom";
import { useEffect, useMemo, useRef, useState } from "react";
import AiChat from "./AiChat";
import ReaderControls from "./ReaderControls";
import ReaderOverlays from "./ReaderOverlays";
import ReaderViewer from "./ReaderViewer";
import { useReaderState } from "./useReaderState";

const Reader = ({
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
  const [isHighlighting, setIsHighlighting] = useState(false);
  const SCROLL_INTERVAL = 5250;
  const [enableAutoScrolling, setEnableAutoScrolling] = useState(false);
  const [enableHighlighting, setEnableHighlighting] = useState(false);
  const [activeHighlightElements, setActiveHighlightElements] = useState<
    HTMLElement[]
  >([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const aiApi = useMemo(() => new AiApi(), []);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const zoomPluginInstance = zoomPlugin();
  const { zoomTo } = zoomPluginInstance;
  const pageNavigationPluginInstance = pageNavigationPlugin();
  const { jumpToPage } = pageNavigationPluginInstance;
  const textQueueRef = useRef<string[]>([]);
  const isProcessingRef = useRef(false);
  const MAX_CHUNK_LENGTH = 1000;

  const {
    zoomLevel,
    setZoomLevel,
    currentPage,
    setCurrentPage,
    totalPages,
    setTotalPages,
    isControlsVisible,
    setIsControlsVisible,
  } = useReaderState();

  const {
    selectedText,
    setSelectedText,
    fullText,
    rootRef,
    extractText,
    getVisibleText,
    getRemainingFullText,
    bookContext,
    getPageText,
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
    isSummarizing,
    isExplaining,
  } = useTextProcessing(bookContext, isHoveredOver);

  const {
    readingState,
    setReadingState,
    autoReading,
    readingSpeed,
    setReadingSpeed,
    handleTextToSpeech,
    stopReading,
    readText,
  } = useReading();

  const { startScrolling, stopScrolling, visibleElements } = useScrolling(
    enableAutoScrolling,
    readingSpeed,
    getVisibleText,
  );

  const { handleHighlighting, stopHighlighting } = useHighlighting(
    activeHighlightElements,
    isHighlighting,
    setIsHighlighting,
    readingSpeed,
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
    if (readingState === "reading" && autoReading.isActivated) {
      startScrolling(SCROLL_INTERVAL);
    } else {
      stopScrolling();
    }
  }, [readingState, autoReading.isActivated]);

  const startHighlighting = () => {
    if (enableHighlighting) {
      setIsHighlighting(true);
    }
  };

  useEffect(() => {
    if (visibleElements.length > 0) {
      const hasDifference =
        visibleElements.length !== activeHighlightElements.length ||
        visibleElements.some((el, index) => {
          const existingElement = activeHighlightElements[index];
          return (
            !existingElement ||
            el.textContent !== existingElement.textContent ||
            el.getBoundingClientRect().top !==
              existingElement.getBoundingClientRect().top
          );
        });

      if (hasDifference) {
        setActiveHighlightElements((prev) => {
          const combinedElements = [...prev, ...visibleElements];
          const uniqueElements = combinedElements.filter(
            (el, index, self) =>
              index ===
              self.findIndex(
                (e) =>
                  e.textContent === el.textContent &&
                  e.getBoundingClientRect().top ===
                    el.getBoundingClientRect().top,
              ),
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
      const { text, elements } = await getVisibleText();
      const visibleChunks = splitTextIntoChunks(text, 500, 50);
      if (visibleChunks.length === 0)
        throw new Error("No visible text chunks found.");
      const firstProcessed = await aiApi.preprocessText(visibleChunks[0]);
      textQueueRef.current = [firstProcessed];
      processQueue();
      setActiveHighlightElements(elements);
      startHighlighting();
      if (settings.ttsType === "basic")
        await cancellableDelay(3000, () => autoReading.isActivated);
      for (
        let i = 1;
        i < visibleChunks.length && autoReading.isActivated;
        i++
      ) {
        try {
          const processed = await aiApi.preprocessText(visibleChunks[i]);
          textQueueRef.current.push(processed);
          if (!isProcessingRef.current && autoReading.isActivated)
            processQueue();
          if (!autoReading.isActivated) break;
          settings.ttsType === "basic"
            ? await cancellableDelay(15000, () => autoReading.isActivated)
            : await cancellableDelay(5000, () => autoReading.isActivated);
        } catch (e) {
          console.error("Error processing visible chunk:", e);
        }
      }
      if (autoReading.isActivated) {
        const remainingText = getRemainingFullText(text, fullText);
        if (remainingText.trim() !== "") {
          const preChunks = splitTextIntoChunks(
            remainingText,
            MAX_CHUNK_LENGTH,
          );
          for (const chunk of preChunks) {
            if (!autoReading.isActivated) break;
            try {
              const processed = await aiApi.preprocessText(chunk);
              textQueueRef.current.push(processed);
              if (!isProcessingRef.current && autoReading.isActivated)
                processQueue();
              if (!autoReading.isActivated) break;
              settings.ttsType === "basic"
                ? await cancellableDelay(60000, () => autoReading.isActivated)
                : await cancellableDelay(30000, () => autoReading.isActivated);
            } catch (e) {
              console.error("Error processing chunk:", e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error in startReading:", error);
      autoReading.isActivated = false;
      setReadingState("off");
    }
  };

  const processQueue = async () => {
    isProcessingRef.current = true;
    while (textQueueRef.current.length > 0 && autoReading.isActivated) {
      const chunk = textQueueRef.current.shift()!;
      try {
        await handleTextToSpeech(chunk);
      } catch (e) {
        console.error("Error processing chunk:", e);
      }
    }
    isProcessingRef.current = false;
    if (textQueueRef.current.length === 0) setReadingState("off");
  };

  useEffect(() => {
    const handleSelectedtext = async () => {
      if (selectedText && selectedText.trim() !== "") {
        setSavedSelectedText(selectedText);
        const preprocessedText = await aiApi.preprocessText(selectedText);
        if (!isValidText(preprocessedText, isSettingsModalOpen)) return;
        if (
          settings?.enableReading &&
          !autoReading.isActivated &&
          !autoReading.isReading &&
          readingState !== "reading"
        ) {
          readText(preprocessedText);
        }
        if (settings?.enableTranslation) getTranslation(preprocessedText);
      }
      setSelectedText(null);
    };
    handleSelectedtext();
  }, [selectedText]);

  const handleStopReading = () => {
    stopReading();
    stopHighlighting();
    autoReading.isActivated = false;
    autoReading.isReading = false;
    textQueueRef.current.length = 0;
    isProcessingRef.current = false;
    if (textQueueRef.current.length === 0) setReadingState("off");
  };

  useEffect(() => {
    if (isHighlighting && readingState === "reading") {
      handleHighlighting();
    } else {
      activeHighlightElements.forEach((el) =>
        el.classList.remove("highlighted-text"),
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

  // Controls Logic
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
      if (viewerRef.current) viewerRef.current.jumpToPage(pageNumber);
    }
  };

  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    jumpToPage(currentPage);
  };

  return (
    <div
      ref={rootRef}
      className={`h-screen w-screen bg-gray-100 relative ${isDarkMode ? `dark-mode-pdf` : ""}`}
      style={{ touchAction: "none" }}
    >
      <ReaderControls
        isDarkMode={isDarkMode}
        isControlsVisible={isControlsVisible}
        setIsControlsVisible={setIsControlsVisible}
        zoomLevel={zoomLevel}
        handleZoomIn={handleZoomIn}
        handleZoomOut={handleZoomOut}
        handleZoomChange={handleZoomChange}
        currentPage={currentPage}
        totalPages={totalPages}
        handlePageInputSubmit={handlePageInputSubmit}
        handlePageInputChange={handlePageInputChange}
      />

      <AiChat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        bookContext={bookContext}
        currentPage={currentPage}
        getPageText={getPageText}
        isDarkMode={isDarkMode}
        language={translationLanguageData?.language || "English"}
      />

      <ReaderViewer
        bookUrl={bookUrl}
        lastPage={lastPage}
        handlePageChange={handlePageChange}
        setTotalPages={setTotalPages}
        viewerRef={viewerRef}
        zoomLevel={zoomLevel}
        zoomPluginInstance={zoomPluginInstance}
        pageNavigationPluginInstance={pageNavigationPluginInstance}
      />

      <ReaderOverlays
        selectedText={selectedText}
        savedSelectedText={savedSelectedText}
        getExplanation={getExplanation}
        getSummary={getSummary}
        startReading={startReading}
        handleStopReading={handleStopReading}
        readingState={readingState}
        isDarkMode={isDarkMode}
        isFullScreen={isFullScreen}
        translation={translation}
        setTranslation={setTranslation}
        explanation={explanation}
        setExplanation={setExplanation}
        summary={summary}
        setSummary={setSummary}
        isSummarizing={isSummarizing}
        isExplaining={isExplaining}
        translationLanguageData={translationLanguageData}
        viewerRef={viewerRef}
        setIsHoveredOver={setIsHoveredOver}
        handleChatClick={() => setIsChatOpen(!isChatOpen)}
      />
    </div>
  );
};

export default Reader;
