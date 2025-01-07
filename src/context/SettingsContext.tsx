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
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
    setIsLoaded(true);
  }, []);

  const updateSettings = (newSettings: Settings) => {
    setSettings(newSettings);
    localStorage.setItem("settings", JSON.stringify(newSettings));
  };

  if (!isLoaded) {
    return null; // or a loading spinner
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
