"use client";

import React from "react";
import Home from "@/components/Home";
import { SettingsProvider } from "@/context/SettingsContext";

const page: React.FC = () => {
  return (
    <>
      <SettingsProvider>
        <Home />
      </SettingsProvider>
    </>
  );
};

export default page;
