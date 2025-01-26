export interface Settings {
  appLanguage: string;
  translationLanguage: {
    language: string;
    rtl: boolean;
  };
  theme: "light" | "dark";
  bookLanguage: string;
  enableTranslation: boolean;
  enableReading: boolean;
  readingSpeed: "slow" | "normal" | "fast";
  ttsType: "premium" | "basic";
  ttsVoice: {
    label: string;
    value: string;
  };
  enableAutoScrolling: boolean;
  enableHighlighting: boolean;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  coverUrl: string; // URL to the book cover image
  fileUrl: string; // URL to the PDF file
  lastAccessed?: number; // Optional timestamp
}
