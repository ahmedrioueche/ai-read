"use client";
import { AiApi } from "@/apis/aiApi";
import { formatLanguage, preprocessText } from "@/utils/helper";
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
import { BookData } from "@/app/page";
import MinimalCard from "./ui/MinimalCard";
import VoiceApi from "@/apis/voiceApi";

const EXCLUDED_TEXT = [
  "AI-READ",
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
}: {
  book: BookData;
  onLastPageChange: (lastPage: number) => void;
  isSettingsModalOpen: boolean;
  isFullScreen: boolean;
}) => {
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [translation, setTranslation] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [bookContext, setBookContext] = useState<string | null>(null);
  const [bookLanguage, setBookLanguage] = useState<string | null>(null);
  const [readingSpeed, setReadingSpeed] = useState<number>(0.9);
  const [readingState, setReadingState] = useState<
    "loading" | "reading" | "off"
  >("off");
  const [isHoverOver, setIsHoverOver] = useState(false);
  const [activeTextCardContent, setActiveTextCardContent] = useState<
    string | null
  >(null);
  const [visibleParagraphs, setVisibleParagraphs] = useState<string[]>([]);
  const [fullText, setFullText] = useState<string>("");
  const settingsData = JSON.parse(localStorage.getItem("settings") || "{}");
  const viewerRef = useRef<any>(null);
  const [lastPage, setLastPage] = useState<number>();
  const [selectionTimeout, setSelectionTimeout] =
    useState<NodeJS.Timeout | null>(null);
  const languageData = settingsData?.languageData;
  const translationLanguage = languageData?.language || "English";
  const aiApi = new AiApi();
  const voiceApi = new VoiceApi();
  const pageNavigationPluginInstance = pageNavigationPlugin();
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const bookUrl = book?.fileUrl;
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [scrollY, setScrollY] = useState(0);
  const [isHighlighting, setIsHighlighting] = useState(false);
  const [availabeVoicesIds, setAvailableVoicesIds] = useState<string[]>([]);
  let autoReading = {
    isActivated: false,
    isReading: false,
  };

  useEffect(() => {
    if (book?.lastPage) {
      const lastPage = book?.lastPage;
      if (!isNaN(lastPage)) {
        setLastPage(lastPage);
      }
    }
    if (book) {
      stopReading();
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

  const getTextToRead = async (): Promise<{
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

  const handleTextToSpeech = async (text: string, settingsData: any) => {
    let isVoiceApiSuccessful = true;
    if (settingsData /*&& settingsData.pro*/) {
      //only allow pro members to use TTS API
      let voiceId;
      /*if (settingsData.pro.selectedVoice) {
        voiceId = settingsData.pro.selectedVoice;
      } else {*/
      if (availabeVoicesIds && availabeVoicesIds.length > 0) {
        voiceId = availabeVoicesIds[0];
      } else {
        voiceId = "nPczCjzI2devNBz1zQrb";
      }
      //}
      try {
        const audioBuffer = await voiceApi.textToSpeech(
          text,
          voiceId || "nPczCjzI2devNBz1zQrb"
        );
        setReadingState("reading");
        const audio = new Audio(URL.createObjectURL(new Blob([audioBuffer])));
        audio.play();
        audio.onended = () => {
          setReadingState("off");
        };

        return;
      } catch (e) {
        isVoiceApiSuccessful = false;
      }
    } else {
      isVoiceApiSuccessful = false;
    }

    if (!isVoiceApiSuccessful) {
      isVoiceApiSuccessful = true;
      readText(text);
    }
  };

  const startReading = async () => {
    const readingQueue: string[] = [];
    setReadingState("loading");
    autoReading.isActivated = true;

    // Fetch text and elements
    const { text, elements } = await getTextToRead();
    const processedText = preprocessText(text);
    // Call the first part of the text to be read
    await handleTextToSpeech(processedText, settingsData);

    // Find the remaining full text
    const remainingFullText = findRemainingFullText(text, fullText);
    const processedRemainingText = preprocessText(remainingFullText);

    // Split the remaining full text into chunks
    const chunks = splitTextIntoChunks(processedRemainingText, 1000);

    // Add the chunks to the queue
    readingQueue.push(...chunks);

    // Start processing the queue
    processReadingQueue(readingQueue);
  };

  // Function to process the queue
  const processReadingQueue = (queue: string[]) => {
    // If there are chunks in the queue and not currently reading, start reading the next chunk
    if (queue.length > 0 && autoReading.isActivated && !autoReading.isReading) {
      const nextChunk = queue.shift(); // Get the next chunk from the queue

      if (nextChunk) {
        handleTextToSpeech(nextChunk, settingsData); // Read the chunk
      }
    }

    if (queue.length > 0) {
      setTimeout(() => processReadingQueue(queue), 200); // Process next chunk when possible
    } else {
      autoReading.isActivated = false;
      setReadingState("off");
    }
  };

  // Function to split text into chunks of a maximum length, ensuring chunks end with a full stop
  const splitTextIntoChunks = (text: string, maxLength: number) => {
    const chunks = [];
    let startIndex = 0;

    while (startIndex < text.length) {
      let endIndex = startIndex + maxLength;

      // Ensure the chunk doesn't break in the middle of a sentence
      if (
        endIndex < text.length &&
        text[endIndex] !== "." &&
        text.lastIndexOf(".", endIndex) !== -1
      ) {
        endIndex = text.lastIndexOf(".", endIndex) + 1; // Move to the last full stop before the chunk limit
      }

      const chunk = text.slice(startIndex, endIndex).trim();
      chunks.push(chunk);
      startIndex = endIndex; // Move the starting point to the end of the chunk
    }

    return chunks;
  };

  const stopReading = () => {
    // Stop the speech synthesis manually
    window.speechSynthesis.cancel();
    autoReading.isActivated = false;
    autoReading.isReading = false;
    setReadingState("off");
    stopHighlighting();
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

        if (settingsData && settingsData.reading) {
          handleTextToSpeech(preprocessedText, settingsData);
        }
        if (settingsData && settingsData.translation) {
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

  useEffect(() => {
    const getVoices = async () => {
      try {
        const response = await voiceApi.getVoices();
        console.log("voices", response);

        // Extract all voice_ids from the voices array
        const voiceIds = response?.voices?.map(
          (voice: { id: string }) => voice.id
        );

        // Set the voice_ids to the state
        setAvailableVoicesIds(voiceIds);

        // Store voiceIds in localStorage
        localStorage.setItem("voicesIds", JSON.stringify(voiceIds));
      } catch (error) {
        console.error("Error fetching voices:", error);
      }
    };

    // Check localStorage for existing voicesIds and set state if they exist
    const voicesIds = localStorage.getItem("voicesIds");
    console.log("voicesIds", voicesIds);

    //if (!voicesIds) {
    // If no voicesIds are found in localStorage, fetch them
    if (!availabeVoicesIds) {
      getVoices();
    }
    //} else {
    // If voicesIds exist in localStorage, use them to set the state
    //setAvailableVoicesIds(JSON.parse(voicesIds));
    // }
  }, []);

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
              languageData={languageData}
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
            languageData={languageData}
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
            languageData={languageData}
            onClose={() => setSummary(null)}
          />
        </div>
      )}
    </div>
  );
};

export default Main;
