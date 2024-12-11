import React from "react";

interface TextCardProps {
  text: string;
  type: "translation" | "explanation" | "summary";
  onClose: () => void;
}

const TextCard: React.FC<TextCardProps> = ({ text, type, onClose }) => {
  // Define colors for each type
  const typeColors: Record<typeof type, string> = {
    translation: "bg-blue-100 border-blue-500",
    explanation: "bg-green-100 border-green-500",
    summary: "bg-pink-100 border-pink-500",
  };

  return (
    <div
      className={`p-4 border-l-4 rounded shadow-md ${typeColors[type]} w-full max-w-md relative max-h-[90vh] overflow-y-auto`}
    >
      {/* Close Button */}
      <button
        className="absolute top-2 right-2 text-gray-600 hover:text-red-500"
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
