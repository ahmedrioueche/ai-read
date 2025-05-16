import { Visitor } from "@prisma/client";
import axios from "axios";

export class VisitorApi {
  getVisitor = async (fingerprint: string) => {
    try {
      const response = await axios.get(`/api/visitor`, {
        params: { fingerprint },
      });
      return response.data;
    } catch (error) {
      console.error("Error getting visitor:", error);
      throw new Error("Failed to get visitor");
    }
  };

  addVisitor = async (fingerprint: string) => {
    try {
      const response = await axios.post(
        "/api/visitor",
        {
          fingerprint,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error adding visitor:", error);
      throw new Error("Failed to add visitor");
    }
  };

  updateVisitor = async (id: string, userData: Partial<Visitor>) => {
    try {
      const response = await axios.patch(
        "/api/visitor",
        {
          id,
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
      console.error("Error updating visitor data:", error);
      throw new Error("Failed to update visitor data");
    }
  };
}
