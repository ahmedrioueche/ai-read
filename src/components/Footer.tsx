"use client";
import React from "react";
import { Linkedin } from "lucide-react"; // Import LinkedIn icon

const Footer: React.FC = () => {
  return (
    <footer className="flex items-center justify-between px-6 py-4 bg-dark-background text-dark-foreground shadow-md">
      {/* Left section (optional text or logo) */}
      <div className="text-sm font-dancing">
        <p>&copy; 2024 AI-Read. All rights reserved.</p>
      </div>

      {/* Right section (LinkedIn icon) */}
      <div className="flex items-center space-x-4">
        <a
          href="https://linkedin.com/in/ahmed-drioueche-aa02732b7"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
        >
          <Linkedin
            size={24}
            className="text-dark-foreground hover:text-dark-secondary transition duration-300"
          />
        </a>
      </div>
    </footer>
  );
};

export default Footer;
