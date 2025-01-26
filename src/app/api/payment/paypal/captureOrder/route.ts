import { NextResponse } from "next/server";
import paypal from "@paypal/checkout-server-sdk";
import { UserService } from "@/services/userService";
import { User } from "@prisma/client";
import { plans, pricing } from "@/utils/constants";
import { formatCurrency } from "@/utils/helper";
const clientId = process.env.PAYPAL_CLIENT_ID;
const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

// Initialize PayPal environment
const environment = new paypal.core.SandboxEnvironment(
  clientId!,
  clientSecret!
);
const client = new paypal.core.PayPalHttpClient(environment);

export async function POST(request: Request) {
  try {
    // Parse the request body to get the order ID, email, and updateData
    const { orderId, email, paymentValue } = await request.json();
    console.log("orderId", orderId);
    console.log("email", email);
    console.log("paymentValue", paymentValue);
    // Validate required fields
    if (!orderId || !email || !paymentValue) {
      return NextResponse.json(
        { message: "Order ID, email, and paymentValue are required." },
        { status: 400 }
      );
    }

    const orderDetailsRequest = new paypal.orders.OrdersGetRequest(orderId);
    const orderDetails = await client.execute(orderDetailsRequest);
    console.log("Order Details:", orderDetails);

    if (orderDetails.result.status !== "APPROVED") {
      throw new Error("Order is not in the APPROVED state.");
    }

    // Step 1: Capture the PayPal payment
    const requestPayPal = new paypal.orders.OrdersCaptureRequest(orderId);
    const captureResponse = await client.execute(requestPayPal);

    // Check if the payment was successfully captured
    if (captureResponse.result.status !== "COMPLETED") {
      return NextResponse.json(
        { message: "Payment not completed." },
        { status: 400 }
      );
    }

    const subExpirationDate = calculateSubExpirationDate(paymentValue);

    const updateData: Partial<User> = {
      lastOrderId: orderId,
      plan: "premium",
      lastPaymentDate: new Date(),
      lastPaymentValue: parseFloat(paymentValue),
      subExpirationDate: subExpirationDate,
    };

    // Step 2: Update user data using UserService
    const userService = new UserService();
    const updateUserResponse = await userService.updateUser(email, updateData);

    // Return a success response with the capture details and user update response
    return NextResponse.json({
      status: "success",
      paymentDetails: captureResponse.result,
      userUpdateResponse: updateUserResponse,
    });
  } catch (error) {
    console.error("Failed to capture order or update user:", error);

    // Return an error response
    return NextResponse.json(
      { message: "Failed to capture order or update user" },
      { status: 500 }
    );
  }
}

const calculateSubExpirationDate = (value: string) => {
  //subscription duration is value divided by the monthly price
  const valueInt = parseInt(value, 10);
  console.log("valueInt", valueInt);
  const monthlyPricingInt = parseFloat(formatCurrency(pricing.premium)); // Convert to number
  console.log("monthlyPricingInt", monthlyPricingInt);

  const subDuration = valueInt / monthlyPricingInt;
  console.log("subDuration", subDuration);

  const currentDate = new Date();
  const subExpirationDate = new Date(
    currentDate.setMonth(currentDate.getMonth() + subDuration)
  );
  console.log("subExpirationDate", subExpirationDate);
  return subExpirationDate;
};
