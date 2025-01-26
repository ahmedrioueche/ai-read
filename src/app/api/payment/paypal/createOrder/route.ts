import { NextResponse } from "next/server";
import paypal from "@paypal/checkout-server-sdk";

const clientId = process.env.PAYPAL_CLIENT_ID;
const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
console.log("clientId", clientId);
console.log("clientSecret", clientSecret);

const environment = new paypal.core.SandboxEnvironment(
  clientId!,
  clientSecret!
);

console.log("environment", environment);
const client = new paypal.core.PayPalHttpClient(environment);
console.log("client", client);

export async function POST(request: Request) {
  try {
    const { amount } = await request.json();

    const requestPayPal = new paypal.orders.OrdersCreateRequest();
    requestPayPal.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: amount,
          },
        },
      ],
    });

    const response = await client.execute(requestPayPal);
    return NextResponse.json({ orderID: response.result.id });
  } catch (error) {
    console.error("Failed to create order:", error);
    return NextResponse.json(
      { message: "Failed to create order" },
      { status: 500 }
    );
  }
}
