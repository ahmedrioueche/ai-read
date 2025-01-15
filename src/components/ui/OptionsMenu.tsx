import React, { useEffect, useState } from "react";
import { Info, FileText, StopCircle, Loader } from "lucide-react";

const OptionsMenu: React.FC<{
  selectedText: string | null;
  getExplanation: () => void;
  getSummary: () => void;
  stopReading: () => void;
  startReading: () => void;
  readingState: "loading" | "reading" | "off";
  isDarkMode: boolean;
  isFullScreen: boolean;
}> = ({
  selectedText,
  getExplanation,
  getSummary,
  stopReading,
  startReading,
  readingState,
  isDarkMode,
  isFullScreen,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isStartReadingClicked, setIsStartReadingClicked] = useState(false);

  useEffect(() => {
    if (readingState === "reading") {
      setIsStartReadingClicked(false);
    }
  }, [readingState]);

  return (
    <div
      className={`fixed ${
        isDarkMode ? (isFullScreen ? "bottom-6" : "bottom-20") : "bottom-6"
      } right-6 z-20 group`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div
        className={`
          absolute right-0 -bottom-4
          ${
            isDarkMode
              ? "bg-gray-900/90 border-gray-700 filter invert hue-rotate-180"
              : "bg-white/90 border-gray-200"
          }
          backdrop-blur-sm 
          border shadow-lg 
          flex flex-col items-start 
          transition-all duration-300 ease-in-out
          ${isExpanded ? "w-40 p-2 rounded-lg" : "w-12 p-1.5 rounded-full"}
          overflow-hidden
        `}
      >
        {/* Vertical Icon Container */}
        <div className="flex flex-col items-start space-y-1 w-full">
          {/* Explanation Icon */}
          {selectedText && (
            <div
              className={`
              cursor-pointer px-2 py-1 rounded-full 
              ${
                isDarkMode
                  ? "hover:bg-gray-700 text-gray-100"
                  : "hover:bg-gray-100 text-gray-700"
              } transition-all
              flex items-center w-full
            `}
              onClick={() => {
                getExplanation();
                setIsExpanded(false);
              }}
            >
              <Info className="w-5 h-5" />
              {isExpanded && (
                <span
                  className={`ml-2 text-xs ${
                    isDarkMode ? "text-gray-100" : "text-gray-700"
                  }`}
                >
                  Explain
                </span>
              )}
            </div>
          )}

          {/* Summary Icon (conditional based on text length) */}
          {selectedText && selectedText.length > 200 && (
            <div
              className={`
                cursor-pointer px-2 py-1 rounded-full 
                ${
                  isDarkMode
                    ? "hover:bg-gray-700 text-gray-100"
                    : "hover:bg-gray-100 text-gray-700"
                } transition-all
                flex items-center w-full
              `}
              onClick={() => {
                getSummary();
                setIsExpanded(false);
              }}
            >
              <FileText className="w-5 h-5" />
              {isExpanded && (
                <span
                  className={`ml-2 text-xs ${
                    isDarkMode ? "text-gray-100" : "text-gray-700"
                  }`}
                >
                  Summarize
                </span>
              )}
            </div>
          )}

          {readingState === "reading" && (
            <div
              className={`
                cursor-pointer px-2 py-1 rounded-full 
                ${
                  isDarkMode
                    ? "hover:bg-gray-700 text-gray-100"
                    : "hover:bg-gray-100 text-gray-700"
                } transition-all
                flex items-center w-full
              `}
              onClick={() => {
                stopReading();
                setIsExpanded(false);
              }}
            >
              <StopCircle className="w-5 h-5 text-red-500" />
              {isExpanded && (
                <span className="ml-2 text-xs text-red-500">Stop Reading</span>
              )}
            </div>
          )}
          {readingState === "off" && (
            <div
              className={`
                cursor-pointer px-2 py-1 rounded-full 
                ${
                  isDarkMode
                    ? "hover:bg-gray-700 text-gray-100"
                    : "hover:bg-gray-100 text-gray-700"
                } transition-all
                flex items-center w-full ${
                  isStartReadingClicked
                    ? isDarkMode
                      ? "bg-gray-700"
                      : "bg-gray-200"
                    : ""
                }
              `}
              onClick={() => {
                setIsStartReadingClicked(true);
                setIsExpanded(false);
                startReading();
              }}
            >
              <StopCircle
                className={`w-5 h-5 ${
                  isDarkMode ? "text-green-400" : "text-green-500"
                }`}
              />
              {isExpanded && (
                <span
                  className={`ml-2 text-xs ${
                    isDarkMode ? "text-green-400" : "text-green-600"
                  }`}
                >
                  Start Reading
                </span>
              )}
            </div>
          )}
          {readingState === "loading" && (
            <div
              className={`
                cursor-pointer px-2 py-1 rounded-full 
                ${
                  isDarkMode
                    ? "hover:bg-gray-700 text-gray-100"
                    : "hover:bg-gray-100 text-gray-700"
                } transition-all
                flex items-center w-full
              `}
            >
              <Loader
                className={`w-5 h-5 ${
                  isDarkMode ? "text-blue-400" : "text-blue-500"
                } animate-spin`}
              />
              {isExpanded && (
                <span
                  className={`ml-2 text-xs ${
                    isDarkMode ? "text-blue-400" : "text-blue-600"
                  }`}
                >
                  Loading....
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OptionsMenu;
