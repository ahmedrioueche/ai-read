"use client";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

export default function PaypalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PayPalScriptProvider
      options={{
        "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
      }}
    >
      {children}
    </PayPalScriptProvider>
  );
}