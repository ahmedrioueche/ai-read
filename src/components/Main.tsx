"use client";
import { AiApi } from "@/apis/aiApi";
import { formatLanguage } from "@/utils/helper";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { franc } from "franc-min";
import pdfToText from "react-pdftotext";
import { useState, useEffect } from "react";
import TextCard from "./ui/TextCard";
import { FileText, Info } from "lucide-react";

const Main = ({ url }: { url: string }) => {
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [translation, setTranslation] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [bookContext, setBookContext] = useState<string | null>(null);
  const [bookLanguage, setBookLanguage] = useState<string | null>(null);
  const [readingSpeed, setReadingSpeed] = useState<number>(0.9);
  const settingsData = JSON.parse(localStorage.getItem("settings") || "{}");
  const language = settingsData?.language || "English";
  const aiApi = new AiApi();

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
  // Function to handle text selection
  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      setSelectedText(selection.toString()); // Store the selected word/text
    }
  };

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

  useEffect(() => {
    // Attach the event listener to handle selection
    window.addEventListener("mouseup", handleTextSelection);

    return () => {
      // Clean up the event listener on component unmount
      window.removeEventListener("mouseup", handleTextSelection);
    };
  }, []);

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
          setTimeout(() => {
            setTranslation(null);
          }, 10000 + response.length * 300);
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

  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  return (
    <div className="h-screen w-screen bg-gray-100 relative">
      <Worker workerUrl="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js">
        <Viewer fileUrl={url} plugins={[defaultLayoutPluginInstance]} />
      </Worker>
      {selectedText && (
        <div className="absolute bottom-32 right-16 bg-gray-200 border shadow-md rounded z-10 h-30 ">
          <ul className="space-y-2">
            <li
              className="cursor-pointer text-center text-black hover:bg-gray-300 p-3 px-6"
              onClick={getExplanation}
            >
              <div className="flex flex-row space-x-2">
                <Info className="mr-2" />
                Explain
              </div>
            </li>
            {selectedText.length > 200 && (
              <li
                className="cursor-pointer text-center text-black hover:bg-gray-300 p-3 px-6"
                onClick={getSummary}
              >
                <div className="flex flex-row space-x-2">
                  <FileText className="mr-2" />
                  Summarize
                </div>
              </li>
            )}
          </ul>
        </div>
      )}

      {translation && (
        <div className="absolute top-10 left-10 z-10">
          <TextCard
            text={translation}
            type="translation"
            onClose={() => setTranslation(null)}
          />
        </div>
      )}

      {explanation && (
        <div className="absolute top-10 right-10 z-10">
          <TextCard
            text={explanation}
            type="explanation"
            onClose={() => {
              setExplanation(null);
            }}
          />
        </div>
      )}

      {summary && (
        <div className="absolute top-60 left-10 z-10">
          <TextCard
            text={summary}
            type="summary"
            onClose={() => {
              setSummary(null);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Main;
