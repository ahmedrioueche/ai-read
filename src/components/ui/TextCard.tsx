import React, { useRef, useEffect } from "react";
import { X, BookOpen, Repeat2, FileText } from "lucide-react";

interface TextCardProps {
  text: string;
  type: "translation" | "explanation" | "summary";
  languageData: { language: string; rtl: boolean };
  onClose: () => void;
  isDarkMode: boolean;
}

const TextCard: React.FC<TextCardProps> = ({
  text,
  type,
  languageData,
  onClose,
  isDarkMode,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  // Handle clicks outside the card
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    // Add event listener when component mounts
    document.addEventListener("mousedown", handleClickOutside);

    // Clean up event listener when component unmounts
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  // Define styling variations with orange theme
  const typeStyles = {
    translation: {
      bgColor: "bg-dark-background",
      borderColor: "border-dark-accent",
      iconBg: "bg-dark-secondary/10",
      iconColor: "text-dark-secondary",
      headerBg: "bg-dark-background",
      icon: <Repeat2 className="text-dark-accent" />,
      title: "Translation",
    },
    explanation: {
      bgColor: "bg-dark-background",
      borderColor: "border-dark-secondary/75",
      iconBg: "bg-dark-secondary/8",
      iconColor: "text-dark-secondary/75",
      headerBg: "bg-dark-background",
      icon: <BookOpen className="text-dark-secondary/75" />,
      title: "Explanation",
    },
    summary: {
      bgColor: "bg-dark-background",
      borderColor: "border-light-secondary",
      iconBg: "bg-dark-secondary/6",
      iconColor: "text-dark-secondary/60",
      headerBg: "bg-dark-background",
      icon: <FileText className="text-dark-secondary/60" />,
      title: "Summary",
    },
  };

  const { bgColor, borderColor, iconBg, iconColor, headerBg, icon, title } =
    typeStyles[type];

  const rtl = languageData?.rtl;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0  z-40" onClick={onClose} />

      {/* Card */}
      <div
        ref={cardRef}
        className={`
          fixed 
          top-1/2
          left-1/2
          transform
          -translate-x-1/2
          -translate-y-1/2
          z-50
          ${bgColor}
          border
          ${borderColor}
          rounded-xl
          shadow-2xl
          overflow-hidden
          w-[90%]
          max-w-[500px]
          max-h-[80vh]
          overflow-y-auto
          animate-inplace-fade  
          ${isDarkMode ? "filter invert hue-rotate-180" : ""}
          scrollbar-hide
        `}
        style={{
          scrollbarWidth: "none" /* Firefox */,
          msOverflowStyle: "none" /* IE and Edge */,
        }}
      >
        {/* Header */}
        <div
          className={`
            flex
            items-center
            justify-between
            p-4
            ${headerBg}
            border-b
            ${borderColor}
          `}
        >
          <div className="flex items-center space-x-3">
            <div
              className={`
                ${iconBg}
                ${iconColor}
                p-2
                rounded-lg
                flex
                items-center
                justify-center
              `}
            >
              {icon}
            </div>
            <h2
              className={`text-lg font-semibold ${
                isDarkMode ? "text-dark-foreground" : "text-dark-foreground"
              }`}
            >
              {title}
            </h2>
          </div>

          <button
            className={`
              ${rtl ? "ml-2" : "mr-2"}
              ${
                isDarkMode
                  ? "text-dark-foreground/60"
                  : "text-dark-foreground/60"
              }
              hover:${borderColor}
              transition
              duration-200
              rounded-full
              p-1
              ${
                isDarkMode
                  ? "hover:bg-dark-secondary/10"
                  : "hover:bg-dark-secondary/10"
              }
            `}
            onClick={onClose}
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div
          className={`
            p-6
            ${isDarkMode ? "text-dark-foreground" : "text-dark-foreground"}
            ${languageData.rtl ? "text-right" : "text-left"}
          `}
        >
          <p className="leading-relaxed">{text}</p>
        </div>

        {/* Add CSS to hide scrollbar for Webkit browsers (Chrome, Safari) */}
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </div>
    </>
  );
};

export default TextCard;
