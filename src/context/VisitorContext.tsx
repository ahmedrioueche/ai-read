import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { VisitorApi } from "@/apis/visitorApi";
import { getFingerprint } from "@/utils/getFingerprint";
import { Visitor } from "@prisma/client";

type VisitorContextType = {
  visitor: Visitor | undefined;
  visitorId: string | null;
  initializeVisitor: () => Promise<void>;
  getVisitor: (fingerprint: string) => Promise<Visitor | null>;
  addVisitor: (fingerprint: string) => Promise<Visitor | null>;
};

const VisitorContext = createContext<VisitorContextType | undefined>(undefined);

export const VisitorProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [visitor, setVisitor] = useState<Visitor>();
  const [visitorId, setVisitorId] = useState<string | null>(null);
  const visitorApi = new VisitorApi();
  const isInitializedRef = useRef(false);

  const getVisitor = async (fingerprint: string) => {
    try {
      const visitor = await visitorApi.getVisitor(fingerprint);
      return visitor;
    } catch (e) {
      console.error("Error getting visitor:", e);
      return null;
    }
  };

  const addVisitor = async (fingerprint: string) => {
    try {
      const newVisitor = await visitorApi.addVisitor(fingerprint);
      return newVisitor;
    } catch (e) {
      console.error("Error adding visitor:", e);
      return null;
    }
  };

  const initializeVisitor = async () => {
    if (!isInitializedRef.current) {
      const fingerprint = await getFingerprint();
      const existingVisitor = await getVisitor(fingerprint);
      
      if (existingVisitor) {
        setVisitorId(existingVisitor.id);
        setVisitor(existingVisitor);
      } else {
        const newVisitor = await addVisitor(fingerprint);
        if (newVisitor) {
          setVisitorId(newVisitor.id);
          setVisitor(newVisitor);
        }
      }
      
      isInitializedRef.current = true;
    }
  };

  // Clean up initialization flag when component unmounts
  useEffect(() => {
    return () => {
      isInitializedRef.current = false;
    };
  }, []);

  return (
    <VisitorContext.Provider
      value={{
        visitor,
        visitorId,
        initializeVisitor,
        getVisitor,
        addVisitor,
      }}
    >
      {children}
    </VisitorContext.Provider>
  );
};

export const useVisitor = () => {
  const context = useContext(VisitorContext);
  if (!context) {
    throw new Error("useVisitor must be used within a VisitorProvider");
  }
  return context;
};
