import { Loader, Settings as SettingsIcon, Type, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import CustomSelect from "./ui/CustomSelect";
import { dict } from "@/utils/dict";
import { User } from "@prisma/client";
import VoiceApi from "@/apis/voiceApi";
import { AiApi } from "@/apis/aiApi";
import { Settings } from "@/utils/types";
import { useSettings } from "@/context/SettingsContext";

// Define options for Typing Modes
const typingModes = [
  { value: "normal", label: "Normal" },
  { value: "fast", label: "Fast" },
  { value: "slow", label: "Slow" },
];

// Include the 15 most used languages
const languages = [
  { value: "english", label: "English", rtl: false },
  { value: "arabic", label: "Arabic", rtl: true },
  { value: "french", label: "French", rtl: false },
  { value: "spanish", label: "Spanish", rtl: false },
  { value: "italian", label: "Italian", rtl: false },
  { value: "german", label: "German", rtl: false },
  { value: "russian", label: "Russian", rtl: false },
  { value: "portuguese", label: "Portuguese", rtl: false },
  { value: "chinese", label: "Chinese", rtl: true },
  { value: "japanese", label: "Japanese", rtl: false },
  { value: "korean", label: "Korean", rtl: false },
  { value: "hindi", label: "Hindi", rtl: false },
  { value: "turkish", label: "Turkish", rtl: false },
  { value: "polish", label: "Polish", rtl: false },
];

type BasicVoice = {
  value: string; // Voice name
  label: string; // Display name
  lang: string; // Language code
};

type PremiumVoice = {
  value: string; // Voice ID
  label: string; // Display name
};

type Voice = BasicVoice | PremiumVoice;

interface SettingsModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  user,
  isOpen,
  onClose,
}) => {
  const { settings, updateSettings } = useSettings();
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("english");
  const [isReading, setIsReading] = useState<boolean>(true);
  const [isTranslation, setIsTranslation] = useState<boolean>(false);
  const [readingSpeed, setReadingSpeed] = useState<"slow" | "normal" | "fast">(
    "normal"
  );
  const [appLanguage, setAppLanguage] = useState("english");
  const [ttsType, setTtsType] = useState<"premium" | "basic">("basic");
  const [ttsVoice, setTtsVoice] = useState<string>("");
  const [bookLanguage, setBookLanguage] = useState("English");
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [highlighting, setHighlighting] = useState<boolean>(true);
  const [basicVoices, setBasicVoices] = useState<Voice[]>([]);
  const [premiumVoices, setPremiumVoices] = useState<Voice[]>([]);
  const [voicesLoading, setVoicesLoading] = useState<boolean>(false);

  const [sampleText, setSampleText] = useState(
    "Welcome to AIRead, the best AI-powered reading platform."
  );
  const isChrome =
    navigator.userAgent.includes("Chrome") &&
    !navigator.userAgent.includes("Edg");

  const text = dict["en"];
  const voiceApi = new VoiceApi();
  const aiApi = new AiApi();
  const [isPlayLoading, setIsPlayLoading] = useState(false);

  useEffect(() => {
    if (settings) {
      setLanguage(settings.translationLanguage?.language || "en");
      setIsTranslation(settings.enableTranslation || false);
      setIsReading(settings.enableReading || false);
      setReadingSpeed(settings.readingSpeed || "normal");
      setAppLanguage(settings.appLanguage || "english");
      setTtsType(settings.ttsType || "basic");
      setTtsVoice(settings.ttsVoice);
      setBookLanguage(settings.bookLanguage || "english");
      setAutoScroll(settings.enableAutoScrolling || false);
      setHighlighting(settings.enableHighlighting || false);
    }
  }, [settings]);

  const handleSave = () => {
    const selectedLanguage = languages.find((lang) => lang.value === language);
    const settings: Settings = {
      translationLanguage: {
        language: selectedLanguage?.value!,
        rtl: selectedLanguage?.rtl!,
      },
      enableTranslation: isTranslation,
      enableReading: isReading,
      readingSpeed: readingSpeed,
      appLanguage: appLanguage,
      ttsType: ttsType,
      ttsVoice: ttsVoice,
      bookLanguage: bookLanguage,
      enableAutoScrolling: autoScroll,
      enableHighlighting: highlighting,
    };

    updateSettings(settings);
    onClose();
  };

  const fetchBuiltInVoices = () => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      setBasicVoices(
        voices.map((voice) => {
          let cleanName = voice.name
            .replace(/^Microsoft\s*/i, "")
            .replace(/\s*Online \(Natural\)\s*/i, "")
            .replace(/\s*\(.*?\)\s*\(.*?\)/, "")
            .trim()
            .replace(/\s*-\s*/, " - ");

          // For Chrome, append the language code to the label
          if (isChrome) {
            cleanName = `${cleanName} (${voice.lang})`;
          }

          return {
            value: voice.name,
            label: cleanName,
            lang: voice.lang, // Include the lang property for filtering
          };
        })
      );
    }
  };

  const fetchPremiumVoices = async () => {
    try {
      const response = await voiceApi.getVoices();

      if (response?.voices && Array.isArray(response.voices)) {
        const apiVoices = response.voices.map((voice: any) => ({
          value: voice.voice_id,
          label: voice.name,
        }));
        setPremiumVoices(apiVoices);
      } else {
        console.error("Invalid API response structure:", response);
      }
    } catch (error) {
      console.error("Failed to fetch API voices:", error);
    }
  };

  useEffect(() => {
    const fetchVoices = async () => {
      setVoicesLoading(true);
      setTtsVoice(""); // Reset ttsVoice when fetching new voices

      if (ttsType === "basic") {
        fetchBuiltInVoices();
        const voicesChangedHandler = () => {
          if (ttsType === "basic") {
            fetchBuiltInVoices();
          }
        };
        window.speechSynthesis.onvoiceschanged = voicesChangedHandler;
      } else {
        await fetchPremiumVoices();
      }

      setVoicesLoading(false);
    };

    fetchVoices();

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [ttsType]);

  // Set default voice based on book language after voices are fetched

  useEffect(() => {
    if (!voicesLoading) {
      const currentVoices = ttsType === "basic" ? basicVoices : premiumVoices;

      // If ttsVoice is already set, do not override it
      if (ttsVoice) {
        return;
      }

      // Set default voice only if ttsVoice is not selected
      if (currentVoices.length > 0) {
        let defaultVoice: Voice | undefined;

        if (ttsType === "basic") {
          // For built-in voices, find a voice that matches the bookLanguage
          defaultVoice = (currentVoices as BasicVoice[]).find((voice) =>
            voice.lang.toLowerCase().includes(bookLanguage.toLowerCase())
          );
        } else {
          // For premium voices, use the first voice as the default
          defaultVoice = currentVoices[0];
        }

        // Set the default voice if found
        if (defaultVoice) {
          setTtsVoice(defaultVoice.value);
        } else {
          // Fallback to the first voice if no matching voice is found
          setTtsVoice(currentVoices[0]?.value || "");
        }
      }
    }
  }, [
    bookLanguage,
    basicVoices,
    premiumVoices,
    ttsType,
    voicesLoading,
    ttsVoice,
  ]);

  const filteredVoices =
    ttsType === "basic"
      ? (basicVoices as BasicVoice[]).filter((voice) => {
          if (isChrome) {
            // For Chrome, do not filter voices (show all voices)
            return true;
          } else {
            // For Edge, filter using the label (name) property
            return voice.label
              .toLowerCase()
              .includes(bookLanguage.toLowerCase());
          }
        })
      : premiumVoices; // No filtering for premium voices

  // Play sample text using the selected voice
  const playSampleText = async () => {
    setIsPlayLoading(true);
    if (ttsType === "basic") {
      const utterance = new SpeechSynthesisUtterance(sampleText);
      const selectedVoice = window.speechSynthesis
        .getVoices()
        .find((voice) => voice.name === ttsVoice);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        window.speechSynthesis.speak(utterance);
      }
    } else {
      try {
        const audio = await voiceApi.textToSpeech(sampleText, ttsVoice);
        const audioBlop = new Blob([audio], { type: "audio/mpeg" });
        playAudio(audioBlop);
      } catch (error) {
        console.error("Failed to play sample text using API:", error);
      }
    }
    setIsPlayLoading(false);
  };

  const playAudio = (audioBlob: Blob) => {
    const audio = new Audio(URL.createObjectURL(audioBlob));
    audio.play();
    audio.onended = () => {};
  };

  useEffect(() => {
    const getSampleText = async () => {
      const text = await aiApi.getTranslation(sampleText, bookLanguage);
      if (text) setSampleText(text);
    };
    getSampleText();
  }, [bookLanguage]);

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-transform duration-300 ${
        isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0"
      }`}
    >
      <div className="bg-dark-background text-dark-foreground rounded-lg shadow-lg p-5 w-full sm:w-[90%] max-w-4xl md:max-h-[80vh] md:h-[80vh] h-[95vh] overflow-y-auto hide-scrollbar">
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center text-dark-foreground">
            <SettingsIcon className="mr-2" />
            <h2 className="text-xl font-bold font-dancing">
              {text.User.settings}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-dark-background hover:bg-dark-secondary transition-colors duration-300 text-dark-foreground"
          >
            <X size={16} />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
          {/* Left Side */}
          <div className="flex flex-col -mt-4 md:mt-0">
            <div className="flex flex-col">
              <CustomSelect
                label="App Language"
                options={languages}
                selectedOption={appLanguage}
                onChange={setAppLanguage}
              />
            </div>

            <div className="mt-6">
              <CustomSelect
                label="Book Language"
                options={languages}
                selectedOption={bookLanguage}
                onChange={setBookLanguage}
              />
            </div>

            <div className="mt-6">
              <label className="font-semibold text-dark-foreground">
                Text To Speech Type
              </label>
              <div className="flex items-center mt-2 space-x-4">
                <div className="flex items-center">
                  <label
                    htmlFor="tts-api-toggle"
                    className="relative inline-block w-12 h-6"
                  >
                    <input
                      id="tts-api-toggle"
                      type="checkbox"
                      checked={ttsType === "premium"}
                      onChange={() => setTtsType("premium")}
                      className="sr-only"
                    />
                    <span
                      className={`block cursor-pointer absolute inset-0 rounded-full transition-colors duration-300 ${
                        ttsType === "premium"
                          ? "bg-dark-secondary"
                          : "bg-gray-300"
                      }`}
                    ></span>
                    <span
                      className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ${
                        ttsType === "premium" ? "transform translate-x-6" : ""
                      }`}
                    ></span>
                  </label>
                  <span className="ml-2">Premium</span>
                </div>
                <div className="flex items-center">
                  <label
                    htmlFor="tts-built-in-toggle"
                    className="relative inline-block w-12 h-6"
                  >
                    <input
                      id="tts-built-in-toggle"
                      type="checkbox"
                      checked={ttsType === "basic"}
                      onChange={() => setTtsType("basic")}
                      className="sr-only"
                    />
                    <span
                      className={`block cursor-pointer absolute inset-0 rounded-full transition-colors duration-300 ${
                        ttsType === "basic"
                          ? "bg-dark-secondary"
                          : "bg-gray-300"
                      }`}
                    ></span>
                    <span
                      className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ${
                        ttsType === "basic" ? "transform translate-x-6" : ""
                      }`}
                    ></span>
                  </label>
                  <span className="ml-2">Basic</span>
                </div>
              </div>
            </div>

            <div className="mt-6">
              {voicesLoading ? (
                <Loader className="animate-spin" />
              ) : (
                <CustomSelect
                  label="Text To Speech Voice"
                  options={filteredVoices}
                  selectedOption={ttsVoice}
                  onChange={setTtsVoice}
                />
              )}
              <div className="flex items-center gap-2 mt-10">
                <div className="relative flex-1">
                  <input
                    id="sample-text"
                    name="sample-text"
                    type="text"
                    value={sampleText}
                    onChange={(e) => setSampleText(e.target.value)}
                    required
                    className="w-full px-3 py-2 pl-10 bg-dark-background border border-dark-accent/70 rounded-lg shadow-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-dark-primary focus:border-transparent text-dark-foreground"
                    placeholder="Enter sample text"
                  />
                  <Type className="h-5 w-5 text-dark-secondary absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>
                <button
                  onClick={playSampleText}
                  className="px-4 py-2 bg-dark-secondary text-light-background rounded-md hover:bg-dark-accent transition-colors duration-300"
                  disabled={isPlayLoading}
                >
                  {isPlayLoading ? <Loader className="animate-spin" /> : "Play"}
                </button>
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex flex-col">
            <div className="flex flex-col">
              <CustomSelect
                label={text.General.translation_language}
                options={languages}
                selectedOption={language}
                onChange={setLanguage}
              />
            </div>
            <div className="flex flex-row justify-between space-x-2">
              <div className="mt-6">
                <label className="font-semibold text-dark-foreground">
                  {text.General.enable_translation}
                </label>
                <div className="flex items-center mt-2">
                  <label
                    htmlFor="translation-toggle"
                    className="relative inline-block w-12 h-6"
                  >
                    <input
                      id="translation-toggle"
                      type="checkbox"
                      checked={isTranslation}
                      onChange={() => setIsTranslation(!isTranslation)}
                      className="sr-only"
                    />
                    <span
                      className={`block cursor-pointer absolute inset-0 rounded-full transition-colors duration-300 ${
                        isTranslation ? "bg-dark-secondary" : "bg-gray-300"
                      }`}
                    ></span>
                    <span
                      className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ${
                        isTranslation ? "transform translate-x-6" : ""
                      }`}
                    ></span>
                  </label>
                </div>
              </div>

              <div className="mt-6">
                <label className="font-semibold text-dark-foreground">
                  {text.General.enable_reading}
                </label>
                <div className="flex items-center mt-2">
                  <label
                    htmlFor="reading-toggle"
                    className="relative inline-block w-12 h-6"
                  >
                    <input
                      id="reading-toggle"
                      type="checkbox"
                      checked={isReading}
                      onChange={() => setIsReading(!isReading)}
                      className="sr-only"
                    />
                    <span
                      className={`block cursor-pointer absolute inset-0 rounded-full transition-colors duration-300 ${
                        isReading ? "bg-dark-secondary" : "bg-gray-300"
                      }`}
                    ></span>
                    <span
                      className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ${
                        isReading ? "transform translate-x-6" : ""
                      }`}
                    ></span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex flex-col mt-6">
              <CustomSelect
                label={text.General.reading_speed}
                options={[
                  { value: "slow", label: text.General.slow },
                  { value: "normal", label: text.General.normal },
                  { value: "fast", label: text.General.fast },
                ]}
                selectedOption={readingSpeed}
                onChange={(value: "slow" | "normal" | "fast") =>
                  setReadingSpeed(value)
                }
              />
            </div>

            <div className="flex flex-row justify-between">
              <div className="mt-6">
                <label className="font-semibold text-dark-foreground">
                  Auto-scrolling
                </label>
                <div className="flex items-center mt-2">
                  <label
                    htmlFor="auto-scroll-toggle"
                    className="relative inline-block w-12 h-6"
                  >
                    <input
                      id="auto-scroll-toggle"
                      type="checkbox"
                      checked={autoScroll}
                      onChange={() => setAutoScroll(!autoScroll)}
                      className="sr-only"
                    />
                    <span
                      className={`block cursor-pointer absolute inset-0 rounded-full transition-colors duration-300 ${
                        autoScroll ? "bg-dark-secondary" : "bg-gray-300"
                      }`}
                    ></span>
                    <span
                      className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ${
                        autoScroll ? "transform translate-x-6" : ""
                      }`}
                    ></span>
                  </label>
                </div>
              </div>

              <div className="mt-6">
                <label className="font-semibold text-dark-foreground">
                  Highlighting
                </label>
                <div className="flex items-center mt-2">
                  <label
                    htmlFor="highlighting-toggle"
                    className="relative inline-block w-12 h-6"
                  >
                    <input
                      id="highlighting-toggle"
                      type="checkbox"
                      checked={highlighting}
                      onChange={() => setHighlighting(!highlighting)}
                      className="sr-only"
                    />
                    <span
                      className={`block cursor-pointer absolute inset-0 rounded-full transition-colors duration-300 ${
                        highlighting ? "bg-dark-secondary" : "bg-gray-300"
                      }`}
                    ></span>
                    <span
                      className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ${
                        highlighting ? "transform translate-x-6" : ""
                      }`}
                    ></span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex md:justify-end justify-start mt-14 ">
              <button
                type="button"
                className="flex w-full justify-center px-4 py-2.5 bg-dark-secondary text-light-background rounded-md font-semibold  hover:bg-dark-accent transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-dark-secondary focus:ring-offset-2"
                onClick={handleSave}
              >
                {loading ? <Loader className="animate-spin" /> : "Save"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
