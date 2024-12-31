import { Loader, Settings, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import CustomSelect from "./ui/CustomSelect";
import useScreen from "@/hooks/useScreen";
import { dict } from "@/utils/dict";

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

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("english");
  const [isReading, setIsReading] = useState<boolean>(true);
  const [isTranslation, setIsTranslation] = useState<boolean>(false);
  const [readingSpeed, setReadingSpeed] = useState<string>("normal");
  const { isSmallScreen } = useScreen();
  const text = dict["en"];

  useEffect(() => {
    let settingsData = JSON.parse(localStorage.getItem("settings") || "{}");
    if (settingsData) {
      setLanguage(settingsData.languageData?.language || "en");
      setIsTranslation(settingsData.translation || true);
      setIsReading(settingsData.reading || true);
      setReadingSpeed(settingsData.readingSpeed || "normal");
    }
  }, []);

  const handleSave = () => {
    const selectedLanguage = languages.find((lang) => lang.value === language);
    const settingsData = {
      languageData: {
        language: selectedLanguage?.value,
        rtl: selectedLanguage?.rtl,
      },
      translation: isTranslation,
      reading: isReading,
      readingSpeed: readingSpeed,
    };

    localStorage.setItem("settings", JSON.stringify(settingsData));
    onClose();
  };

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-transform duration-300 ${
        isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0"
      }`}
    >
      <div className="bg-dark-background rounded-lg shadow-lg p-5 w-full sm:w-[90%] max-w-3xl max-h-[99%] h-full sm:h-auto overflow-y-auto hide-scrollbar">
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center text-dark-foreground">
            <Settings className="mr-2" />
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
          <div className="flex justify-center items-center">
            <img
              src="/images/settings-story-set.svg"
              alt="Settings"
              className={`object-contain ${
                isSmallScreen ? " w-36 h-36" : "w-50 h-50"
              } `}
            />
          </div>

          <div className="flex flex-col -mt-4 md:mt-0">
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

            <div className="flex flex-col mt-4">
              <CustomSelect
                label={text.General.reading_speed}
                options={[
                  { value: "slow", label: text.General.slow },
                  { value: "normal", label: text.General.normal },
                  { value: "fast", label: text.General.fast },
                ]}
                selectedOption={readingSpeed}
                onChange={setReadingSpeed}
              />
            </div>
            <div className="flex md:justify-end justify-start mt-9 ">
              <button
                type="button"
                className="flex w-full justify-center px-4 py-3 bg-dark-secondary text-light-background rounded-md font-semibold  hover:bg-dark-accent transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-dark-secondary focus:ring-offset-2"
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
