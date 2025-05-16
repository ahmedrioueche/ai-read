import { Settings, User } from "@prisma/client";
import axios from "axios";

export class UserApi {
  // Method to update user data
  updateUser = async (email: string, userData: Partial<User>) => {
    try {
      const response = await axios.post(
        "/api/user",
        {
          email,
          updateData: userData,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error updating user data:", error);
      throw new Error("Failed to update user data");
    }
  };

  getSettings = async (id: string) => {
    try {
      const response = await axios.get("/api/settings", { params: { id } });

      return response.data;
    } catch (error) {
      console.error("Error getting settings:", error);
      throw new Error("Failed to get settings");
    }
  };

  updateSettings = async (id: string, updatedSettings: Partial<Settings>) => {
    try {
      const response = await axios.post(
        "/api/settings",
        {
          id,
          updatedSettings,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error updating settings:", error);
      throw new Error("Failed to update settings");
    }
  };
}
