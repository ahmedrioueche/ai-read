import { useEffect } from "react";

interface useAppInitializationProps {
  initializeVisitor: () => void;
  initPlan: (visitor: any) => void;
  visitor: any;
}

export const useAppInitialization = ({
  initializeVisitor,
  initPlan,
  visitor,
}: useAppInitializationProps) => {
  // Initialize visitor on mount
  useEffect(() => {
    initializeVisitor();
  }, [initializeVisitor]);

  // Initialize plan when visitor is available
  useEffect(() => {
    if (visitor) {
      initPlan(visitor);
    }
  }, [visitor, initPlan]);
};
