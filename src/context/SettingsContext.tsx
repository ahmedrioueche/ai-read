// contexts/SettingsContext.tsx
"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import type { Settings } from "@/utils/types";

type SettingsContextType = {
  settings: Settings;
  updateSettings: (newSettings: Settings) => void;
};

const defaultSettings: Settings = {
  translationLanguage: { language: "en", rtl: false },
  enableTranslation: false,
  enableReading: false,
  readingSpeed: "normal",
  appLanguage: "en",
  ttsType: "basic",
  ttsVoice: "",
  bookLanguage: "en",
  enableAutoScrolling: false,
  enableHighlighting: false,
};

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load settings from localStorage after component mounts
    const savedSettings = localStorage.getItem("settings");
    let settingsData: Settings;

    if (savedSettings) {
      settingsData = JSON.parse(savedSettings);
      // Check if any required settings are missing and initialize them
      if (
        !settingsData.translationLanguage ||
        !settingsData.readingSpeed ||
        !settingsData.bookLanguage ||
        !settingsData.ttsType ||
        !settingsData.ttsVoice
      ) {
        settingsData = {
          ...defaultSettings,
          ...settingsData,
          translationLanguage: settingsData.translationLanguage || {
            language: "en",
            rtl: false,
          },
          readingSpeed: settingsData.readingSpeed || "normal",
          bookLanguage: settingsData.bookLanguage || "en",
          ttsType: settingsData.ttsType || "basic",
          ttsVoice: settingsData.ttsVoice,
        };
        localStorage.setItem("settings", JSON.stringify(settingsData));
      }
    } else {
      // If no settings exist, initialize with default settings
      settingsData = defaultSettings;
      localStorage.setItem("settings", JSON.stringify(settingsData));
    }

    setSettings(settingsData);
    setIsLoaded(true);
  }, []);

  const updateSettings = (newSettings: Settings) => {
    setSettings(newSettings);
    localStorage.setItem("settings", JSON.stringify(newSettings));
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
