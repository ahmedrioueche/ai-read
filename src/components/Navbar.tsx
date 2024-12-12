"use client";
import React, { useState, useEffect } from "react";
import { Cog, Rocket, Maximize2, ChevronDown } from "lucide-react"; // Importing Fullscreen and back icons
import SettingsModal from "./SettingsModal";

const Navbar: React.FC<{
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ onUpload }) => {
  const [isSettingModalOpen, setIsSettingModalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Check if the document is in fullscreen mode
  const checkFullscreen = () => {
    if (document.fullscreenElement) {
      setIsFullscreen(true);
    } else {
      setIsFullscreen(false);
    }
  };

  // Fullscreen Toggle Function
  const handleFullscreen = () => {
    if (!isFullscreen) {
      // Enter fullscreen mode
      document.documentElement.requestFullscreen();
    } else {
      // Exit fullscreen mode
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Set up a listener to check fullscreen status
  useEffect(() => {
    document.addEventListener("fullscreenchange", checkFullscreen);
    document.addEventListener("webkitfullscreenchange", checkFullscreen);
    document.addEventListener("mozfullscreenchange", checkFullscreen);
    document.addEventListener("MSFullscreenChange", checkFullscreen);

    // Clean up the event listeners on unmount
    return () => {
      document.removeEventListener("fullscreenchange", checkFullscreen);
      document.removeEventListener("webkitfullscreenchange", checkFullscreen);
      document.removeEventListener("mozfullscreenchange", checkFullscreen);
      document.removeEventListener("MSFullscreenChange", checkFullscreen);
    };
  }, []);

  return (
    <>
      <nav
        className={`${
          isFullscreen ? "hidden" : "flex"
        } items-center justify-between px-6 py-4 z-50 bg-dark-background text-dark-foreground shadow-md`}
      >
        {/* Logo */}
        <div className="flex flex-row items-center space-x-2">
          <img src="/images/Fireball.svg" alt="Logo" className="h-7 w-7" />
          <div className="text-xl font-bold font-dancing">AI-Read</div>
        </div>

        {/* Icons */}
        <div className="flex items-center space-x-6">
          <div className="flex flex-row items-center font-dancing cursor-pointer hover:text-dark-secondary transition duration-300">
            <label
              htmlFor="file-upload"
              className="flex items-center cursor-pointer"
            >
              <Rocket />
              <input
                id="file-upload"
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={onUpload}
              />
            </label>
          </div>
          {/* Settings Icon */}
          <button
            onClick={() => setIsSettingModalOpen(true)}
            aria-label="Settings"
            className="hover:text-dark-secondary transition duration-300"
          >
            <Cog size={24} />
          </button>

          {/* Fullscreen Icon */}
          <button
            onClick={handleFullscreen}
            aria-label="Fullscreen"
            className="hover:text-dark-secondary transition duration-300"
          >
            <Maximize2 size={24} />
          </button>
        </div>

        <SettingsModal
          isOpen={isSettingModalOpen}
          onClose={() => setIsSettingModalOpen(false)}
        />
      </nav>

      {/* Floating button to bring navbar back */}
      {isFullscreen && (
        <button
          onClick={handleFullscreen}
          className="fixed bottom-4 right-4 bg-dark-background text-dark-foreground p-2 rounded-full shadow-md hover:text-dark-secondary transition duration-300"
          aria-label="Exit Fullscreen"
        >
          <ChevronDown size={24} />
        </button>
      )}
    </>
  );
};

export default Navbar;
