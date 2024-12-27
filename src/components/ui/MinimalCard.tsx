import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

interface MinimalCardProps {
  text: string;
  onClose: () => void;
}

const MinimalCard: React.FC<MinimalCardProps> = ({ text, onClose }) => {
  useEffect(() => {
    const handleScroll = () => {
      onClose(); // Close the card on scroll
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [onClose]);

  return (
    <div
      className={`
        fixed 
        bottom-0 
        left-0 
        right-0 
        bg-gray-900 
        text-white 
        py-3 
        px-4 
        shadow-lg 
        rounded-t-lg 
        flex 
        items-center 
        justify-between 
        transition-transform 
        duration-300 
        animate-slide-up
        z-50
        w-[80%]
      `}
    >
      <span className="text-sm font-medium truncate">{text}</span>
      <button
        onClick={onClose}
        className="ml-4 text-gray-300 hover:text-red-400 transition duration-200"
        aria-label="Close"
      >
        <X size={20} />
      </button>
    </div>
  );
};

export default MinimalCard;
