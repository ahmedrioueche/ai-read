import { Settings } from "@/utils/types";
import React, { createContext, useContext, useState } from "react";

// Define the context type
type SettingsContextType = {
  settings: Settings;
  updateSettings: (newSettings: Settings) => void;
};

// Create the context
const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

// Create a provider component
export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [settings, setSettings] = useState<Settings>(() => {
    // Load settings from localStorage or use defaults
    const savedSettings = localStorage.getItem("settings");
    return savedSettings
      ? JSON.parse(savedSettings)
      : {
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
  });

  const updateSettings = (newSettings: Settings) => {
    setSettings(newSettings);
    localStorage.setItem("settings", JSON.stringify(newSettings));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

// Custom hook to use the settings context
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
