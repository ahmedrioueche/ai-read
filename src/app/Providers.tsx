"use client";
import React from "react";
import { SettingsProvider } from "@/context/SettingsContext";
import { PlanProvider } from "@/context/PlanContext";
import { VisitorProvider } from "@/context/VisitorContext";
import { AuthProvider } from "@/context/AuthContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <VisitorProvider>
        <AuthProvider>
          <PlanProvider>{children}</PlanProvider>
        </AuthProvider>
      </VisitorProvider>
    </SettingsProvider>
  );
}
