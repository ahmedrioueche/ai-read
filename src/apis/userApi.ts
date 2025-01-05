import { User } from "@prisma/client";
import axios from "axios";

export class UserApi {
  // Method to update user data
  updateUserData = async (email: string, userData: Partial<User>) => {
    try {
      const response = await axios.post(
        "/api/user/update",
        {
          email,
          updateData: userData, // Make sure this is structured correctly
        },
        {
          headers: {
            "Content-Type": "application/json", // Ensure JSON is sent
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error updating user data:", error);
      throw new Error("Failed to update user data");
    }
  };
}
