import React, { useEffect, useState } from "react";
import { Info, FileText, StopCircle, Loader, Repeat2 } from "lucide-react";

const PageOptionsMenu: React.FC<{
  sectionText: string | null;
  getExplanation: () => void;
  getSummary: () => void;
  isDarkMode: boolean;
  isFullScreen: boolean;
}> = ({
  sectionText,
  getExplanation,
  getSummary,
  isDarkMode,
  isFullScreen,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={`fixed ${isDarkMode ? "top-20" : "top-6"} right-6 z-20 group`}
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
          ${isExpanded ? "w-44 p-2 rounded-lg" : "w-12 p-1.5 rounded-full"}
          overflow-hidden
        `}
      >
        {/* Vertical Icon Container */}
        <div className="flex flex-col items-start space-y-1 w-full">
          {/* Summary Icon  */}
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
                Summarize section
              </span>
            )}
          </div>
          {/* Explanation Icon */}
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
                Explain section
              </span>
            )}
          </div>

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
            <Repeat2 className="w-5 h-5" />
            {isExpanded && (
              <span
                className={`ml-2 text-xs ${
                  isDarkMode ? "text-gray-100" : "text-gray-700"
                }`}
              >
                Translate section
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageOptionsMenu;
