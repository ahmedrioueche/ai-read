import { Settings, User, Visitor } from "@prisma/client";
import axios from "axios";

export class VisitorApi {
  getVisitor = async (fingerprint: string) => {
    try {
      const response = await axios.post(
        "/api/visitor/get",
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
      console.error("Error getting visitor:", error);
      throw new Error("Failed to get visitor");
    }
  };

  addVisitor = async (fingerprint: string) => {
    try {
      const response = await axios.post(
        "/api/visitor/add",
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
      const response = await axios.post(
        "/api/visitor/update",
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
