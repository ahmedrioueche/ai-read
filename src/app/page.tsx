"use client";

import React, { useEffect, useState } from "react";
import PDFViewer from "../components/Main";
import Landing from "@/components/Landing";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Home: React.FC = () => {
  const [pdfFileUrl, setPdfFileUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onloadend = () => {
        const fileUrl = reader.result as string;
        setPdfFileUrl(fileUrl);
        // Save the Data URL of the loaded PDF to localStorage
        localStorage.setItem("lastPdfUrl", fileUrl);
      };

      // Read the file as a Data URL
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    // Load the last loaded PDF Data URL from localStorage
    const lastPdfUrl = localStorage.getItem("lastPdfUrl");
    if (lastPdfUrl) {
      setPdfFileUrl(lastPdfUrl);
    }

    let settingsData = JSON.parse(localStorage.getItem("settings") || "{}");
    if (
      !settingsData.languageData ||
      !settingsData.translation ||
      !settingsData.reading ||
      !settingsData.readingSpeed
    ) {
      settingsData = {
        languageData: { language: "english", rtl: false },
        translation: true,
        reading: true,
        readingSpeed: "normal",
      };

      // Save the default settings to localStorage
      localStorage.setItem("settings", JSON.stringify(settingsData));
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-dark-background">
      {/* Navbar */}
      <Navbar onUpload={handleFileChange} />

      {/* Main Content */}
      <div
        className={`flex flex-col items-center z-10 ${
          !pdfFileUrl ? "-mt-10" : ""
        }`}
      >
        {/* Adjusted padding-top */}
        {!pdfFileUrl ? (
          <Landing onFileChange={handleFileChange} />
        ) : (
          <PDFViewer url={pdfFileUrl} />
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Home;
