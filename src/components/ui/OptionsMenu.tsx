import React, { useEffect, useState } from "react";
import { Info, FileText, StopCircle, Loader } from "lucide-react";

const OptionsMenu: React.FC<{
  selectedText: string | null;
  getExplanation: () => void;
  getSummary: () => void;
  stopReading: () => void;
  startReading: () => void;
  readingState: "loading" | "reading" | "off";
}> = ({
  selectedText,
  getExplanation,
  getSummary,
  stopReading,
  startReading,
  readingState,
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
      className="fixed bottom-6 right-6 z-20 group"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div
        className={`
          absolute right-0 -bottom-4
          bg-white/90 backdrop-blur-sm 
          border border-gray-200 shadow-lg 
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
              hover:bg-gray-100 transition-all
              flex items-center w-full
            `}
              onClick={() => {
                getExplanation();
                setIsExpanded(false);
              }}
            >
              <Info className="w-5 h-5 text-gray-700" />
              {isExpanded && (
                <span className="ml-2 text-xs text-gray-700">Explain</span>
              )}
            </div>
          )}

          {/* Summary Icon (conditional based on text length) */}
          {selectedText && selectedText.length > 200 && (
            <div
              className={`
                cursor-pointer px-2 py-1 rounded-full 
                hover:bg-gray-100 transition-all
                flex items-center w-full
              `}
              onClick={() => {
                getSummary();
                setIsExpanded(false);
              }}
            >
              <FileText className="w-5 h-5 text-gray-700" />
              {isExpanded && (
                <span className="ml-2 text-xs text-gray-700">Summarize</span>
              )}
            </div>
          )}

          {readingState === "reading" && (
            <div
              className={`
                cursor-pointer px-2 py-1 rounded-full 
                hover:bg-gray-100 transition-all
                flex items-center w-full
              `}
              onClick={() => {
                stopReading();
                setIsExpanded(false);
              }}
            >
              <StopCircle className="w-5 h-5 text-red-500" />
              {isExpanded && (
                <span className="ml-2 text-xs text-red-600">Stop Reading</span>
              )}
            </div>
          )}
          {readingState === "off" && (
            <div
              className={`
                cursor-pointer px-2 py-1 rounded-full 
                hover:bg-gray-100 transition-all
                flex items-center w-full ${
                  isStartReadingClicked ? "bg-gray-200" : ""
                }
              `}
              onClick={() => {
                setIsStartReadingClicked(true);
                setIsExpanded(false);
                startReading();
              }}
            >
              <StopCircle className="w-5 h-5 text-green-500" />
              {isExpanded && (
                <span className="ml-2 text-xs text-green-600">
                  Start Reading
                </span>
              )}
            </div>
          )}
          {readingState === "loading" && (
            <div
              className={`
                cursor-pointer px-2 py-1 rounded-full 
                hover:bg-gray-100 transition-all
                flex items-center w-full
              `}
            >
              <Loader className="animate-spin w-5 h-5 text-blue-500 " />
              {isExpanded && (
                <span className="ml-2 text-xs text-blue-600">Loading....</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OptionsMenu;
