"use client";
import React, { useState } from "react";
import { Cog, Rocket } from "lucide-react";
import SettingsModal from "./SettingsModal";

const Navbar: React.FC<{
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ onUpload }) => {
  const [isSettingModalOpen, setIsSettingModalOpen] = useState(false);

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-dark-background text-dark-foreground shadow-md">
      {/* Logo */}
      <div className="flex flex-row items-center space-x-2">
        <img src="/images/FireBall.svg" alt="" className="h-7 w-7" />
        <div className="text-xl font-bold font-dancing">AI-Read</div>
      </div>

      <div className="flex flex-row items-center font-dancing cursor-pointer hover:text-dark-secondary transition duration-300">
        <label
          htmlFor="file-upload"
          className="flex items-center cursor-pointer"
        >
          <Rocket className="mr-2" />
          <span>New</span>
          <input
            id="file-upload"
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={onUpload}
          />
        </label>
      </div>

      {/* Icons */}
      <div className="flex items-center space-x-6">
        {/* Settings Icon */}
        <button
          onClick={() => setIsSettingModalOpen(true)}
          aria-label="Settings"
          className="hover:text-dark-secondary transition duration-300"
        >
          <Cog size={24} />
        </button>
      </div>

      <SettingsModal
        isOpen={isSettingModalOpen}
        onClose={() => setIsSettingModalOpen(false)}
      />
    </nav>
  );
};

export default Navbar;
