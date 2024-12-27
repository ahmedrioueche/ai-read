import React, { useState, useEffect } from "react";
import { Cog, Rocket, Maximize2, ChevronDown } from "lucide-react";
import SettingsModal from "./SettingsModal";
import { dict } from "@/utils/dict";

const Navbar: React.FC<{
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onToggleSettingsModal: (isSettingModalOpen: boolean) => void;
  onToggleFullScreen: (isFullScreen: boolean) => void;
}> = ({ onUpload, onToggleSettingsModal, onToggleFullScreen }) => {
  const [isSettingModalOpen, setIsSettingModalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const language = "en";
  const text = dict[language];

  const checkFullscreen = () => {
    if (document.fullscreenElement) {
      setIsFullscreen(true);
      onToggleFullScreen(true);
    } else {
      setIsFullscreen(false);
      onToggleFullScreen(false);
    }
  };

  const handleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen();
      onToggleFullScreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        onToggleFullScreen(false);
      }
    }
  };

  const handleIconClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event from bubbling up
  };

  useEffect(() => {
    document.addEventListener("fullscreenchange", checkFullscreen);
    document.addEventListener("webkitfullscreenchange", checkFullscreen);
    document.addEventListener("mozfullscreenchange", checkFullscreen);
    document.addEventListener("MSFullscreenChange", checkFullscreen);

    return () => {
      document.removeEventListener("fullscreenchange", checkFullscreen);
      document.removeEventListener("webkitfullscreenchange", checkFullscreen);
      document.removeEventListener("mozfullscreenchange", checkFullscreen);
      document.removeEventListener("MSFullscreenChange", checkFullscreen);
    };
  }, []);

  return (
    <div>
      <nav
        className={`${
          isFullscreen ? "hidden" : "flex"
        } items-center justify-between px-6 py-4 z-50 bg-dark-background text-dark-foreground shadow-md`}
      >
        <div className="flex flex-row items-center space-x-2">
          <img src="/images/Fireball.svg" alt="Logo" className="h-7 w-7" />
          <div className="text-xl font-bold font-dancing">{text.App.name}</div>
        </div>

        <div className="flex items-center space-x-6" onClick={handleIconClick}>
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
          <button
            onClick={() => {
              setIsSettingModalOpen(true);
              onToggleSettingsModal(true);
            }}
            aria-label="Settings"
            className="hover:text-dark-secondary transition duration-300"
          >
            <Cog size={24} />
          </button>

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
          onClose={() => {
            setIsSettingModalOpen(false);
            onToggleSettingsModal(false);
          }}
        />
      </nav>

      {isFullscreen && (
        <button
          onClick={handleFullscreen}
          className="fixed bottom-4 right-4 bg-dark-background text-dark-foreground p-2 rounded-full shadow-md hover:text-dark-secondary transition duration-300"
          aria-label="Exit Fullscreen"
        >
          <ChevronDown size={24} />
        </button>
      )}
    </div>
  );
};

export default Navbar;
