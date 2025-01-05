declare module "@paypal/react-paypal-js" {
  import * as React from "react";

  export interface PayPalScriptProviderProps {
    options: Record<string, any>;
    children: React.ReactNode;
  }

  export const PayPalScriptProvider: React.FC<PayPalScriptProviderProps>;

  export interface PayPalButtonsProps {
    createOrder?: (data: any, actions: any) => Promise<string>;
    onApprove?: (data: any, actions: any) => Promise<void>;
    onError?: (error: any) => void;
    style?: Record<string, any>;
  }

  export const PayPalButtons: React.FC<PayPalButtonsProps>;
}
