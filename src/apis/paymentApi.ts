import { User } from "@prisma/client";

export class PaypalApi {
  private baseUrl = "/api/payment/paypal";

  /**
   * Creates a PayPal order by calling the server-side API.
   * @param amount - The amount to charge (in USD).
   * @returns The order ID.
   */
  async createOrder(amount: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/createOrder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount }),
      });

      if (!response.ok) {
        throw new Error("Failed to create order");
      }

      const data = await response.json();
      return data.orderID;
    } catch (error) {
      console.error("Failed to create order:", error);
      throw error;
    }
  }

  /**
   * Captures a PayPal payment by calling the server-side API.
   * @param orderId - The PayPal order ID.
   * @returns The capture details.
   */
  async captureOrder(
    orderId: string,
    email: string,
    paymentValue: string
  ): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/captureOrder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId, email, paymentValue }),
      });

      if (!response.ok) {
        throw new Error("Failed to capture order");
      }

      const data = await response.json();
      return data.details;
    } catch (error) {
      console.error("Failed to capture order:", error);
      throw error;
    }
  }
}
