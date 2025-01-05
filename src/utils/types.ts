export interface Settings {
  appLanguage: string;
  translationLanguage: {
    language: string;
    rtl: boolean;
  };
  bookLanguage: string;
  enableTranslation: boolean;
  enableReading: boolean;
  readingSpeed: "slow" | "normal" | "fast";
  ttsType: "premium" | "basic";
  ttsVoice: string;
  enableAutoScrolling: boolean;
  enableHighlighting: boolean;
}
