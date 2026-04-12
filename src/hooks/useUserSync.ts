import { useEffect } from "react";
import { User } from "@prisma/client";
import { UserApi } from "@/apis/userApi";

interface UseUserSyncProps {
  user: User | null;
  visitor: any;
  userApi: UserApi;
}

export const useUserSync = ({ user, visitor, userApi }: UseUserSyncProps) => {
  useEffect(() => {
    const updateUser = async () => {
      if (user && user?.email?.trim() !== "" && visitor) {
        // Normalize both dates to UTC
        const userDateUTC = new Date(user.freeTrialStartDate).toISOString();
        const visitorDateUTC = new Date(
          visitor.freeTrialStartDate
        ).toISOString();

        // Compare the normalized UTC dates
        if (userDateUTC !== visitorDateUTC) {
          // Add 1 hour offset to have a correct comparison later
          const adjustedVisitorDate = new Date(visitor.freeTrialStartDate);
          adjustedVisitorDate.setHours(adjustedVisitorDate.getHours() + 1);
          try {
            await userApi.updateUser(user.email, {
              freeTrialStartDate: adjustedVisitorDate,
            });
          } catch (error) {
            console.error("Failed to update user free trial date:", error);
          }
        }
      }
    };
    updateUser();
  }, [user, visitor, userApi]);
};
