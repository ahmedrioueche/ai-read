"use client";
import { AiApi } from "@/apis/aiApi";
import {
  formatLanguage,
  getLanguageName,
  preprocessText,
  splitTextIntoChunks,
} from "@/utils/helper";
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
import { BookData } from "@/components/Home";
import MinimalCard from "./ui/MinimalCard";
import VoiceApi from "@/apis/voiceApi";
import { Settings } from "@/utils/types";
import { useSettings } from "@/context/SettingsContext";

const EXCLUDED_TEXT = [
  "AIREAD",
  "translation",
  "summary",
  "explanation",
  "explain",
  "stop reading",
];

const Main = ({
  book,
  onLastPageChange,
  isSettingsModalOpen,
  isFullScreen,
  onBookLanguage,
}: {
  book: BookData;
  onLastPageChange: (lastPage: number) => void;
  isSettingsModalOpen: boolean;
  isFullScreen: boolean;
  onBookLanguage: (bookLanguage: string) => void;
}) => {
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [translation, setTranslation] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [bookContext, setBookContext] = useState<string | null>(null);
  const [currentBookId, setCurrentBookId] = useState("");
  const [bookLanguage, setBookLanguage] = useState<string | null>(null);
  const [readingSpeed, setReadingSpeed] = useState<number>(0.9);
  const [readingState, setReadingState] = useState<
    "loading" | "reading" | "off"
  >("off");
  const [isHoverOver, setIsHoverOver] = useState(false);
  const [activeTextCardContent, setActiveTextCardContent] = useState<
    string | null
  >(null);
  const [fullText, setFullText] = useState<string>("");
  const { settings, updateSettings } = useSettings();
  const translationLanguageData = settings.translationLanguage;
  const viewerRef = useRef<any>(null);
  const [lastPage, setLastPage] = useState<number>();
  const [selectionTimeout, setSelectionTimeout] =
    useState<NodeJS.Timeout | null>(null);
  const aiApi = new AiApi();
  const voiceApi = new VoiceApi();
  const pageNavigationPluginInstance = pageNavigationPlugin();
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const bookUrl = book?.fileUrl;
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [scrollY, setScrollY] = useState(0);
  const [isHighlighting, setIsHighlighting] = useState(false);
  const [scrollIntervalId, setScrollIntervalId] = useState<number>();
  const SCROLL_INTERVAL = 5250;
  const [currentPremiumAudio, setCurrentPremiumAudio] =
    useState<HTMLAudioElement | null>(null);
  const [autoReading, setAutoReading] = useState<{
    isActivated: Boolean;
    isReading: Boolean;
  }>({ isActivated: false, isReading: false });
  const [translationLanguage, setTranslationLanguage] = useState("");
  const [ttsType, setTtsType] = useState<"premium" | "basic">("basic");
  const [ttsVoice, setTtsVoice] = useState("");
  const [enableAutoScrolling, setEnableAutoScrolling] = useState(false);
  const [enableHighlighting, setEnableHighlighting] = useState(false);
  let audioQueue: Blob[] = [];
  const [currentTextChunk, setCurrentTextChunk] = useState("");
  const [visibleText, setVisibleText] = useState("");

  useEffect(() => {
    const translationLanguage =
      settings?.translationLanguage?.language || "English";
    setTranslationLanguage(translationLanguage);
    setTtsType(settings?.ttsType);
    setTtsVoice(settings?.ttsVoice);
    setEnableAutoScrolling(settings?.enableAutoScrolling);
    setEnableHighlighting(settings?.enableHighlighting);
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
      stopReading();
      setCurrentBookId(book.id);
    }
  }, [book]);

  const handlePageChange = (e: any) => {
    const newPage = e.currentPage;
    onLastPageChange(parseInt(newPage, 10));
  };

  const extractText = async (fileUrl: string) => {
    try {
      // Fetch the entire PDF file
      const response = await fetch(fileUrl);
      const fileBlob = await response.blob();

      const text = await pdfToText(fileBlob);

      setFullText(text); // Set the full text asynchronously
      const limitedText = text.slice(0, 5000);

      setBookContext(limitedText);

      const detectedLanguage = franc(limitedText);

      // Set the detected language
      setBookLanguage(detectedLanguage);
      const bookLanguage = getLanguageName(detectedLanguage);
      settings.bookLanguage = bookLanguage;
      updateSettings(settings);
    } catch (error) {
      console.error("Failed to extract text from PDF:", error);
    }
  };

  useEffect(() => {
    if (bookUrl) {
      extractText(bookUrl);
    }
  }, [bookUrl]);

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

  const readText = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      const isInTextCard =
        activeTextCardContent &&
        activeTextCardContent.includes(selectedText || "");
      const selectedVoice = window.speechSynthesis
        .getVoices()
        .find((voice) => voice.name === ttsVoice);

      const language = isInTextCard
        ? formatLanguage(translationLanguage)
        : formatLanguage(
            selectedText && selectedText.length > 10
              ? franc(selectedText)
              : bookLanguage
          ) || "en-US";

      let lang = language || "en-US";
      utterance.lang = lang;
      utterance.pitch = 1.1; // Set pitch (range 0 to 2)
      utterance.rate = readingSpeed; // Set rate (range 0.1 to 10)
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onstart = () => {
        setReadingState("reading");
        autoReading.isReading = true;
      };

      utterance.onend = () => {
        if (!autoReading.isActivated) {
          setReadingState("off");
        }
        autoReading.isReading = false;
      };

      // Speak the text
      window.speechSynthesis.speak(utterance);
    } else {
      console.error("Speech synthesis is not supported in this browser.");
    }
  };

  const getTtsVoiceId = (): string => {
    if (ttsVoice) {
      return ttsVoice;
    }
    return "nPczCjzI2devNBz1zQrb"; // Default voice ID
  };

  const fetchTtsAudio = async (text: string): Promise<Blob> => {
    const voiceId = getTtsVoiceId();
    const audioBuffer = await voiceApi.textToSpeech(text, voiceId);
    return new Blob([audioBuffer], { type: "audio/mpeg" });
  };

  const getTopOffset = () => {
    return isFullScreen ? 60 : 120 - scrollY;
  };

  const findLastSentenceBoundary = (text: string): number => {
    // Match periods, question marks, or exclamation marks followed by space or end of string
    const matches = [...text.matchAll(/[.!?](?:\s+|$)/g)];
    if (matches.length === 0) return -1;

    // Get the index of the last match
    const lastMatch = matches[matches.length - 1];
    return lastMatch.index! + 1; // Include only the punctuation mark, not the following space
  };

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
      const topOffset = getTopOffset();

      for (const layer of textLayers) {
        const layerRect = layer.getBoundingClientRect();

        const isLayerVisible =
          layerRect.top < viewportHeight &&
          layerRect.bottom > topOffset &&
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
                rect.bottom > topOffset &&
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
      const lastSentenceBoundary = findLastSentenceBoundary(trimmedText);

      // If we found a sentence boundary, cut the text there, but keep the punctuation
      const visibleText =
        lastSentenceBoundary > -1
          ? trimmedText.substring(0, lastSentenceBoundary + 1) // Include the punctuation mark
          : trimmedText;

      return { text: visibleText, elements: elementsToHighlight };
    } catch (error) {
      console.error("Error getting text to speak:", error);
      return { text: "", elements: [] };
    }
  };

  const findRemainingFullText = (
    visibleText: string,
    fullText: string
  ): string => {
    // Normalize texts while preserving meaningful structure
    const normalizeText = (text: string) => {
      return text
        .trim()
        .replace(/\s+/g, " ") // Normalize whitespace to single spaces
        .replace(/["""]/g, '"') // Normalize quotes
        .replace(/['']/g, "'"); // Normalize apostrophes
    };

    const cleanVisibleText = normalizeText(visibleText);
    const cleanFullText = normalizeText(fullText);

    // Take the last significant chunk of visible text to ensure unique matching
    const lastChunkSize = Math.min(cleanVisibleText.length, 200);
    const lastVisibleChunk = cleanVisibleText.slice(-lastChunkSize);

    if (!lastVisibleChunk) {
      console.error("Could not extract chunk from visible text");
      return fullText;
    }

    // Find the exact position where this chunk appears in full text
    const chunkPosition = cleanFullText.indexOf(lastVisibleChunk);

    if (chunkPosition === -1) {
      console.error("Could not find visible chunk in full text");
      return fullText;
    }

    // Calculate the end position - this is where our visible text ends
    const endPosition = chunkPosition + lastVisibleChunk.length;

    // Convert position in normalized text to position in original text
    let originalTextPosition = 0;
    let normalizedTextPosition = 0;

    // Align positions between normalized and original text
    while (
      normalizedTextPosition < endPosition &&
      originalTextPosition < fullText.length
    ) {
      // Skip extra whitespace in original text
      while (
        originalTextPosition < fullText.length &&
        /\s/.test(fullText[originalTextPosition])
      ) {
        originalTextPosition++;
      }

      // Skip extra whitespace in normalized text
      while (
        normalizedTextPosition < cleanFullText.length &&
        /\s/.test(cleanFullText[normalizedTextPosition])
      ) {
        normalizedTextPosition++;
      }

      // Move both positions forward for regular characters
      if (normalizedTextPosition < endPosition) {
        originalTextPosition++;
        normalizedTextPosition++;
      }
    }

    // Return everything after the visible text position
    // Start right after the last complete sentence in visible text
    return fullText.slice(originalTextPosition).trim();
  };

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const calculateChunkDuration = (text: string): number => {
    const length = text.length; // Estimate word count
    return length * 10; // Convert to milliseconds
  };

  const handleTextToSpeech = async (text: string) => {
    const chunks = splitTextIntoChunks(text, ttsType === "premium" ? 200 : 400); // Split text into chunks

    if (ttsType === "premium") {
      // TTS API is enabled
      try {
        // Fetch and store audio for the first chunk
        const firstChunk = chunks[0];
        if (firstChunk) {
          if (autoReading.isActivated) {
            const audioBlob = await fetchTtsAudio(firstChunk);
            audioQueue.push(audioBlob); // Add the first chunk to the queue
            playNextAudio(); // Start playback immediately
            setCurrentTextChunk(firstChunk);
          }
        }

        // Fetch and store audio for the remaining chunks in the background
        for (let i = 1; i < chunks.length; i++) {
          if (autoReading.isActivated) {
            //delay to not fetch audio that might not be used (user stops autoread)
            const previousChunk = chunks[i - 1];
            const delayDuration = calculateChunkDuration(previousChunk);
            await delay(delayDuration);

            const chunk = chunks[i];
            try {
              const audioBlob = await fetchTtsAudio(chunk);
              audioQueue.push(audioBlob); // Add to the queue
              setCurrentTextChunk(chunk);

              console.log("Audio blob added for chunk:", chunk);
            } catch (error) {
              console.error("Error fetching audio for chunk:", chunk, error);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching TTS API audio:", error);
        // Fallback to built-in TTS if TTS API fails
        for (const chunk of chunks) {
          if (!autoReading.isReading) {
            readText(chunk);
            setCurrentTextChunk(chunk);
          }
        }
      }
    } else {
      // TTS API is disabled, use built-in TTS
      for (const chunk of chunks) {
        if (!autoReading.isReading) {
          readText(chunk);
          setCurrentTextChunk(chunk);
        }
      }
    }
  };

  const playAudio = (audioBlob: Blob) => {
    console.log("playAudio");
    const audio = new Audio(URL.createObjectURL(audioBlob));
    audio.play();
    setCurrentPremiumAudio(audio);
    audio.onended = () => {
      autoReading.isReading = false; // Update reading state
      playNextAudio(); // Play the next audio in the queue
    };
    autoReading.isReading = true; // Update reading state
  };

  const playNextAudio = () => {
    console.log("autoReading in playNextAudio", autoReading);

    if (audioQueue.length > 0) {
      if (autoReading.isActivated && !autoReading.isReading) {
        setReadingState("reading");
        const audioBlob = audioQueue.shift(); // Get the next audio from the queue
        if (audioBlob) {
          playAudio(audioBlob);
        }
      }
    } else {
      stopReading();
    }
  };

  const startScrolling = () => {
    if (enableAutoScrolling) {
      const id = scrollPDF(SCROLL_INTERVAL);
      if (id) setScrollIntervalId(id);
    }
  };

  const stopScrolling = () => {
    if (scrollIntervalId) {
      clearInterval(scrollIntervalId);
    }
  };

  useEffect(() => {
    if (readingState === "reading") {
      startScrolling();
    } else {
      stopScrolling();
    }
  }, [readingState]);

  const startReading = async () => {
    setReadingState("loading");
    autoReading.isActivated = true;

    try {
      // Fetch text and elements
      const { text, elements } = await getVisibleText();
      const processedText = preprocessText(text);
      await handleTextToSpeech(processedText);

      // Find and process remaining text in parallel
      const remainingFullText = findRemainingFullText(text, fullText);

      if (remainingFullText) {
        const processedRemainingText = preprocessText(remainingFullText);
        await handleTextToSpeech(processedRemainingText);
      }
    } catch (error) {
      console.error("Error in startReading:", error);
      autoReading.isActivated = false;
    }
  };

  const stopPremiumAudio = () => {
    if (currentPremiumAudio) {
      currentPremiumAudio.pause();
      currentPremiumAudio.currentTime = 0;
      currentPremiumAudio.onended = null; // Remove the onended handler to prevent further actions
      setCurrentPremiumAudio(null);
    }
    audioQueue = []; // Clear the audio queue
  };

  const stopReading = () => {
    stopPremiumAudio();
    window.speechSynthesis.cancel();
    setAutoReading({ isActivated: false, isReading: false });
    autoReading.isActivated = false; ///dont ask my why
    setReadingState("off");
    stopHighlighting();
    stopScrolling();
  };

  useEffect(() => {
    const getTranslation = async (text: string) => {
      if (selectedText && selectedText.trim() !== "") {
        const response = await aiApi.getTranslation(text, translationLanguage);
        console.log({ response });
        if (response) {
          setTranslation(response);
          setTimeout(() => {
            if (!isHoverOver) {
              setTranslation(null);
            }
          }, 5000 + response.length * 200);
        }
      }
    };

    const isValidText = (text: string): boolean => {
      if (isSettingsModalOpen) return false;

      // Check if text matches any excluded keywords
      return !EXCLUDED_TEXT.some((excluded) => excluded === text.toLowerCase());
    };

    const handleSelectedtext = async () => {
      if (selectedText && selectedText.trim() !== "") {
        const preprocessedText = preprocessText(selectedText);
        if (!isValidText(preprocessedText)) return;

        if (settings && settings.enableReading) {
          handleTextToSpeech(preprocessedText);
        }
        if (settings && settings.enableTranslation) {
          getTranslation(preprocessedText);
        }
      }
    };

    handleSelectedtext();
  }, [selectedText]);

  const getSummary = async () => {
    if (selectedText && selectedText.trim() !== "") {
      const preprocessedText = preprocessText(selectedText);
      const response = await aiApi.getSummary(
        preprocessedText,
        translationLanguage
      );
      if (response) {
        setSummary(response);
        setTimeout(() => {
          if (!isHoverOver) {
            setSummary(null);
          }
        }, 5000 + response.length * 200);
      }
    }
  };

  const getExplanation = async () => {
    if (selectedText && selectedText.trim() !== "") {
      const preprocessedText = preprocessText(selectedText);
      const response = await aiApi.getExplantion(
        preprocessedText,
        translationLanguage,
        bookContext!
      );
      if (response) {
        setExplanation(response);
        setTimeout(() => {
          if (!isHoverOver) {
            setExplanation(null);
          }
        }, 5000 + response.length * 200);
      }
    }
  };

  const scrollPDF = (scrollSpeed: number): number | null => {
    const container = document.querySelector(
      ".rpv-core__inner-pages"
    ) as HTMLElement;
    if (!container) {
      console.log("Scroll container not found");
      return null;
    }

    let lastVisibleTextLength = 0; // Track the length of the last visible text
    let lastScrollOffset = 30 * readingSpeed; // Track the last scroll offset

    const intervalId = window.setInterval(async () => {
      // Check if we've reached the end of the document
      if (
        container.scrollTop + container.clientHeight >=
        container.scrollHeight
      ) {
        clearInterval(intervalId);
        console.log("Reached the end of the document");
        return;
      }

      // Get the currently visible text using the existing getVisibleText function
      const { text: visibleText } = await getVisibleText();
      setVisibleText(visibleText);
      // Calculate the scroll offset based on visible text length
      const currentVisibleTextLength = visibleText.length;
      console.log("currentVisibleTextLength", currentVisibleTextLength);

      // Calculate the scroll offset dynamically
      const scrollOffset = calculateScrollOffset(
        currentVisibleTextLength,
        lastVisibleTextLength,
        lastScrollOffset,
        readingSpeed
      );

      console.log("current scrollOffset", scrollOffset);

      // Update the last visible text length and scroll offset
      lastVisibleTextLength = currentVisibleTextLength;
      lastScrollOffset = scrollOffset;

      // Scroll downward with the calculated offset
      container.scrollBy({
        top: scrollOffset,
        behavior: "smooth",
      });
    }, scrollSpeed);

    return intervalId;
  };

  const calculateScrollOffset = (
    currentTextLength: number,
    lastTextLength: number,
    lastScrollOffset: number,
    readingSpeed: number
  ): number => {
    const baselineOffset = 22; // Baseline scroll offset
    const minOffset = baselineOffset * readingSpeed; // Minimum scroll offset
    const maxOffset = baselineOffset * 20; // Maximum scroll offset (e.g., 600)
    // Calculate the difference between current and last text length
    const textLengthDifference = lastTextLength - currentTextLength;

    // If text length is above 1000, reset to baseline offset
    if (currentTextLength > 1000) {
      return baselineOffset * readingSpeed;
    }

    // Adjust the scroll offset linearly based on the text length difference
    let scrollOffset = lastScrollOffset;

    if (textLengthDifference > 0) {
      // If text length is decreasing, increase the scroll offset linearly
      const increaseFactor = textLengthDifference / lastTextLength; // Normalized difference
      scrollOffset = lastScrollOffset * (1 + increaseFactor);
    } else if (textLengthDifference < 0) {
      // If text length is increasing, decrease the scroll offset linearly
      const decreaseFactor = -textLengthDifference / lastTextLength; // Normalized difference
      scrollOffset = lastScrollOffset * (1 - decreaseFactor);
    }

    // Ensure the scroll offset stays within reasonable bounds
    scrollOffset = Math.max(minOffset, Math.min(scrollOffset, maxOffset));

    return scrollOffset;
  };

  const toggleHighlighting = (elements: HTMLElement[], stop = false) => {
    if (stop) {
      setIsHighlighting(false);

      // Remove any highlight class from all elements
      elements.forEach((el) => el.classList.remove("highlighted-text"));
      return;
    }

    if (!isHighlighting) {
      setIsHighlighting(true);
      let currentIndex = 0;

      const highlightNextElement = () => {
        if (currentIndex > 0) {
          elements[currentIndex - 1].classList.remove("highlighted-text");
        }

        if (currentIndex < elements.length) {
          elements[currentIndex].classList.add("highlighted-text");
          currentIndex++;
          setTimeout(highlightNextElement, 200);
        }
      };

      if (elements.length > 0) {
        highlightNextElement();
      } else {
        setIsHighlighting(false);
      }
    }
  };

  const stopHighlighting = () => {
    const elements = Array.from(
      document.querySelectorAll(".rpv-core__text-layer-text")
    ) as HTMLElement[];
    toggleHighlighting(elements, true);
  };

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
      stopReading();
    };

    // Add event listener to stop reading on page refresh or navigation
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      // Clean up event listener
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    if (translation) {
      setActiveTextCardContent(translation);
    } else if (explanation) {
      setActiveTextCardContent(explanation);
    } else if (summary) {
      setActiveTextCardContent(summary);
    } else {
      setActiveTextCardContent(null);
    }
  }, [translation, explanation, summary]);

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

  const isDarkMode = false;
  return (
    <div
      ref={rootRef}
      className={`h-screen w-screen bg-gray-100 relative ${
        isDarkMode ? `dark-mode` : ""
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
        getExplanation={getExplanation}
        getSummary={getSummary}
        stopReading={stopReading}
        startReading={startReading}
        readingState={readingState}
      />

      {translation &&
        (selectedText && selectedText?.trim()?.split(" ")?.length < 20 ? (
          <div className="flex justify-center items-center fixed bottom-0 left-1/2 transform -translate-x-1/2 md:w-[80%] w-full z-50">
            <MinimalCard
              text={translation}
              onClose={() => setTranslation(null)}
              viewerRef={viewerRef}
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
          />
        </div>
      )}
    </div>
  );
};

export default Main;
