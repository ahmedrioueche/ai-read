import React, { useState } from "react";
import { Info, FileText, StopCircle } from "lucide-react";

const OptionsMenu: React.FC<{
  selectedText: string | null;
  getExplanation: () => void;
  getSummary: () => void;
  stopReading: () => void;
  isReading: boolean;
}> = ({ selectedText, getExplanation, getSummary, stopReading, isReading }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className="fixed bottom-6 right-6 z-20 group"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div
        className={`
          absolute right-0 bottom-0 
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
          <div
            className={`
              cursor-pointer px-2 py-1 rounded-full 
              hover:bg-gray-100 transition-all
              flex items-center w-full
            `}
            onClick={getExplanation}
          >
            <Info className="w-5 h-5 text-gray-700" />
            {isExpanded && (
              <span className="ml-2 text-xs text-gray-700">Explain</span>
            )}
          </div>

          {/* Summary Icon (conditional based on text length) */}
          {selectedText && selectedText.length > 200 && (
            <div
              className={`
                cursor-pointer px-2 py-1 rounded-full 
                hover:bg-gray-100 transition-all
                flex items-center w-full
              `}
              onClick={getSummary}
            >
              <FileText className="w-5 h-5 text-gray-700" />
              {isExpanded && (
                <span className="ml-2 text-xs text-gray-700">Summarize</span>
              )}
            </div>
          )}

          {/* Stop Reading Icon (conditional) */}
          {isReading && (
            <div
              className={`
                cursor-pointer px-2 py-1 rounded-full 
                hover:bg-gray-100 transition-all
                flex items-center w-full
              `}
              onClick={stopReading}
            >
              <StopCircle className="w-5 h-5 text-red-500" />
              {isExpanded && (
                <span className="ml-2 text-xs text-red-600">Stop Reading</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OptionsMenu;
