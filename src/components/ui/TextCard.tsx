import React from "react";

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
  // Define colors for each type
  const typeColors: Record<typeof type, string> = {
    translation: "bg-blue-100 border-blue-500",
    explanation: "bg-green-100 border-green-500",
    summary: "bg-pink-100 border-pink-500",
  };
  const rtl = languageData?.rtl;

  return (
    <div
      className={`
        p-4 
        ${rtl ? "border-r-4" : "border-l-4"} 
        rounded 
        shadow-md 
        ${typeColors[type]} 
        w-full 
        sm:w-[80vw] 
        sm:max-w-[80%] 
        relative 
        max-h-[50vh] 
        overflow-y-auto
      `}
      style={{
        marginTop: "5vh",
        marginBottom: "5vh",
        width: "calc(100vw - 5rem)", // Full width on mobile minus some padding
        maxWidth: "500px", // Reasonable max-width on larger screens
      }}
    >
      {/* Close Button */}
      <button
        className={`absolute top-1 ${
          rtl ? "right-2" : "left-2"
        } text-gray-600 hover:text-red-500`}
        onClick={onClose}
        aria-label="Close"
      >
        &times;
      </button>

      {/* Content */}
      <div className="text-gray-800">
        <p className="mt-2">{text}</p>
      </div>
    </div>
  );
};

export default TextCard;
