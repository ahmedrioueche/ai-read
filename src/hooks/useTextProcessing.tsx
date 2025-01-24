import { useState } from "react";
import { AiApi } from "@/apis/aiApi";
import { useSettings } from "@/context/SettingsContext";

const EXCLUDED_TEXT = [
  "AIREAD",
  "translation",
  "summary",
  "explanation",
  "explain",
  "stop reading",
];

const useTextProcessing = (
  bookContext: string | null,
  isHoveredOver: boolean
) => {
  const [translation, setTranslation] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const { settings } = useSettings();
  const translationLanguage =
    settings?.translationLanguage?.language || "English";
  const aiApi = new AiApi();

  const isValidText = (text: string, isSettingsModalOpen: boolean): boolean => {
    if (isSettingsModalOpen) return false;
    // Check if text matches any excluded keywords
    return !EXCLUDED_TEXT.some(
      (excluded) => excluded.toLowerCase() === text.toLowerCase()
    );
  };

  const getTranslation = async (text: string) => {
    if (text.trim() !== "") {
      const response = await aiApi.getTranslation(text, translationLanguage);
      if (response) {
        setTranslation(response);
        setTimeout(() => {
          if (!isHoveredOver) {
            setTranslation(null);
          }
        }, 5000 + response.length * 200);
      }
    }
  };

  const getSummary = async (text: string) => {
    if (text.trim() !== "") {
      const response = await aiApi.getSummary(text, translationLanguage);
      if (response) {
        setSummary(response);
        setTimeout(() => {
          if (!isHoveredOver) {
            setSummary(null);
          }
        }, 5000 + response.length * 200);
      }
    }
  };

  const getExplanation = async (text: string) => {
    if (text.trim() !== "") {
      const response = await aiApi.getExplantion(
        text,
        translationLanguage,
        bookContext!
      );
      if (response) {
        setExplanation(response);
        setTimeout(() => {
          if (!isHoveredOver) {
            setExplanation(null);
          }
        }, 5000 + response.length * 200);
      }
    }
  };

  return {
    translation,
    summary,
    explanation,
    setTranslation,
    setExplanation,
    setSummary,
    getTranslation,
    getSummary,
    getExplanation,
    isValidText,
  };
};

export default useTextProcessing;
