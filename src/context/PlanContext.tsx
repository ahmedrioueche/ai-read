import React, { createContext, useContext, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { UserApi } from "@/apis/userApi";
import { VisitorApi } from "@/apis/visitorApi";
import { Visitor } from "@prisma/client";

type Plan = "free-trial" | "basic" | "premium" | "pro";

type PlanContextType = {
  plan: Plan;
  isFreeTrialModalOpen: boolean;
  setIsFreeTrialModalOpen: (isOpen: boolean) => void;
  isFreeTrialActive: boolean;
  freeTrialEndDate: Date | null;
  isFreeTrial: boolean;
  init: (visitor: Visitor) => void;
};

const PlanContext = createContext<PlanContextType | undefined>(undefined);

export const PlanProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [isFreeTrialModalOpen, setIsFreeTrialModalOpen] = useState(false);
  const [isFreeTrialActive, setIsFreeTrialActive] = useState(false);
  const [freeTrialEndDate, setFreeTrialEndDate] = useState<Date | null>(null);
  const [isFreeTrial, setIsFreeTrial] = useState(false);
  const [visitorState, setVisitorState] = useState<Visitor>();

  const userApi = new UserApi();
  const visitorApi = new VisitorApi();

  const calculateFreeTrialEndDate = useCallback((startDate: Date): Date => {
    const freeTrialDurationInDays = 30;
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + freeTrialDurationInDays);
    return endDate;
  }, []);

  const checkIfFreeTrialEnded = useCallback((endDate: Date): boolean => {
    const now = new Date();
    return now >= endDate;
  }, []);

  const shouldShowModal = useCallback(
    (freeTrialShownAt: Date | null, endDate: Date): boolean => {
      return (
        !freeTrialShownAt ||
        (checkIfFreeTrialEnded(endDate) && freeTrialShownAt < endDate)
      );
    },
    [checkIfFreeTrialEnded]
  );

  const updateUserPlan = async (email: string) => {
    try {
      await userApi.updateUser(email, { plan: "basic" });
    } catch (error) {
      console.error("Error updating user plan:", error);
    }
  };

  const updateVisitorTrialStatus = async (visitorId: string) => {
    try {
      await visitorApi.updateVisitor(visitorId, { isFreeTrial: false });
    } catch (error) {
      console.error("Error updating visitor trial status:", error);
    }
  };

  const updateFreeTrialShownAt = async (
    entity: "user" | "visitor",
    identifier: string
  ) => {
    try {
      const now = new Date();
      if (entity === "user") {
        await userApi.updateUser(identifier, { freeTrialShownAt: now });
      } else if (entity === "visitor") {
        await visitorApi.updateVisitor(identifier, { freeTrialShownAt: now });
      }
    } catch (error) {
      console.error(`Error updating freeTrialShownAt for ${entity}:`, error);
    }
  };

  const init = useCallback(
    (visitor: Visitor) => {
      // Set the visitor state
      setVisitorState(visitor);

      // Prioritize user logic if user exists
      if (user && user.email.trim() !== "") {
        if (user.plan === "free-trial") {
          setIsFreeTrial(true);

          if (user.freeTrialStartDate) {
            const endDate = calculateFreeTrialEndDate(user.freeTrialStartDate);

            if (
              !freeTrialEndDate ||
              endDate.getTime() !== freeTrialEndDate.getTime()
            ) {
              setFreeTrialEndDate(endDate);
            }

            const trialEnded = checkIfFreeTrialEnded(endDate);
            setIsFreeTrialActive(!trialEnded);

            if (trialEnded && user.id) {
              updateUserPlan(user.email);
            }

            if (shouldShowModal(user.freeTrialShownAt, endDate)) {
              setIsFreeTrialModalOpen(true);
              updateFreeTrialShownAt("user", user.email);
            }
          }
        } else {
          setIsFreeTrial(false);
        }
      }
      // Fall back to visitor logic if user does not exist
      else if (visitor && visitor.isFreeTrial) {
        setIsFreeTrial(true);

        if (visitor.freeTrialStartDate) {
          const endDate = calculateFreeTrialEndDate(visitor.freeTrialStartDate);

          if (
            !freeTrialEndDate ||
            endDate.getTime() !== freeTrialEndDate.getTime()
          ) {
            setFreeTrialEndDate(endDate);
          }

          const trialEnded = checkIfFreeTrialEnded(endDate);
          setIsFreeTrialActive(!trialEnded);

          if (trialEnded && visitor.id) {
            updateVisitorTrialStatus(visitor.id);
          }

          if (shouldShowModal(visitor.freeTrialShownAt, endDate)) {
            setIsFreeTrialModalOpen(true);
            updateFreeTrialShownAt("visitor", visitor.id);
          }
        }
      } else {
        setIsFreeTrial(false);
      }
    },
    [user, visitorState, freeTrialEndDate]
  );

  // Determine the current plan
  const getPlan = (): Plan => {
    if (user) {
      // If the user is logged in, return their plan
      return user.plan as Plan;
    } else if (visitorState) {
      // If the visitor is on a free trial, return "free-trial"
      if (visitorState.isFreeTrial) {
        return "free-trial";
      } else {
        // If the visitor is not on a free trial, return "basic"
        return "basic";
      }
    } else {
      // If there is no user and no visitor, return "basic"
      return "basic";
    }
  };

  const plan = getPlan();

  return (
    <PlanContext.Provider
      value={{
        plan,
        isFreeTrialModalOpen,
        setIsFreeTrialModalOpen,
        isFreeTrialActive,
        freeTrialEndDate,
        isFreeTrial,
        init,
      }}
    >
      {children}
    </PlanContext.Provider>
  );
};

export const usePlan = () => {
  const context = useContext(PlanContext);
  if (!context) {
    throw new Error("usePlan must be used within a PlanProvider");
  }
  return context;
};
