import React from "react";
import { X, BookOpen, Repeat2, FileText } from "lucide-react";

interface TextCardProps {
  text: string;
  type: "translation" | "explanation" | "summary";
  languageData: { language: string; rtl: boolean };
  onClose: () => void;
}

const TextCard: React.FC<TextCardProps> = ({
  text,
  type,
  languageData,
  onClose,
}) => {
  // Define comprehensive styling for each type
  const typeStyles = {
    translation: {
      bgColor: "bg-sky-50",
      borderColor: "border-sky-500",
      iconBg: "bg-sky-100",
      icon: <Repeat2 className="text-sky-600" />,
      title: "Translation",
    },
    explanation: {
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-500",
      iconBg: "bg-emerald-100",
      icon: <BookOpen className="text-emerald-600" />,
      title: "Explanation",
    },
    summary: {
      bgColor: "bg-rose-50",
      borderColor: "border-rose-500",
      iconBg: "bg-rose-100",
      icon: <FileText className="text-rose-600" />,
      title: "Summary",
    },
  };

  const { bgColor, borderColor, iconBg, icon, title } = typeStyles[type];

  const rtl = languageData?.rtl;

  return (
    <div
      className={`
        fixed 
        top-1/2 
        left-1/2 
        transform 
        -translate-x-1/2 
        -translate-y-1/2 
        z-50 
        ${bgColor} 
        ${borderColor} 
        ${rtl ? "border-r-4" : "border-l-4"}
        rounded-xl 
        shadow-2xl 
        overflow-hidden 
        w-[90%] 
        max-w-[500px]
        max-h-[80vh]
        overflow-y-auto
        animate-fade-in
      `}
    >
      {/* Header with Icon and Close Button */}
      <div
        className={`
          flex 
          items-center 
          justify-between 
          p-4 
          border-b 
          ${borderColor}
        `}
      >
        <div className="flex items-center space-x-3">
          <div
            className={`
              ${iconBg} 
              p-2 
              rounded-full 
              flex 
              items-center 
              justify-center
            `}
          >
            {icon}
          </div>
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        </div>

        <button
          className={`
            ${rtl ? "ml-2" : "mr-2"} 
            text-gray-500 
            hover:text-red-500 
            transition 
            duration-200 
            rounded-full 
            p-1 
            hover:bg-red-50
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
          p-4 
          text-gray-700 
          ${languageData.rtl ? "text-right" : "text-left"}
        `}
      >
        <p className="leading-relaxed">{text}</p>
      </div>
    </div>
  );
};

export default TextCard;
