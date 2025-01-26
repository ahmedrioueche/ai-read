"use client";
import React, { useEffect, useState } from "react";
import { PayPalButtons } from "@paypal/react-paypal-js";
import PaypalProvider from "@/components/PaypalProvider";
import { plans, pricing } from "@/utils/constants";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Alert from "@/components/ui/Alert";
import { CheckCircle, Loader, LucideIcon, XCircle } from "lucide-react";
import { AppAlerts } from "@/lib/appAlerts";
import CustomSelect from "@/components/ui/CustomSelect";
import { PaypalApi } from "@/apis/paymentApi";
import { formatCurrency } from "@/utils/helper";

const plan = plans.find((plan) => plan.name === "Premium");

const paymentOptions = [
  { label: "1 Month", value: "1" },
  { label: "2 Months", value: "2" },
  { label: "3 Months", value: "3" },
  { label: "4 Months", value: "4" },
  { label: "5 Months", value: "5" },
  { label: "6 Months", value: "6" },
  { label: "7 Months", value: "7" },
  { label: "8 Months", value: "8" },
  { label: "9 Months", value: "9" },
  { label: "10 Months", value: "10" },
  { label: "11 Months", value: "11" },
  { label: "1 Year", value: "12" },
];

const Payment: React.FC = () => {
  const { user } = useAuth();
  console.log({ user });
  const router = useRouter();
  const [status, setStatus] = useState<{
    status: string;
    message: string;
    bg?: string;
    icon?: LucideIcon;
  }>();
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const appAlerts = new AppAlerts();
  const [selectedPaymentOptionValue, setSelectedPaymentOptionValue] =
    useState("1");
  const [paymentValue, setPaymentValue] = useState(pricing.premium);
  const [discountString, setDiscountString] = useState("0");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const selectedPaymentOptionValueInt = parseInt(
      selectedPaymentOptionValue,
      10
    );
    const paymentValue =
      parseFloat(pricing.premium) * selectedPaymentOptionValueInt;
    const discount =
      selectedPaymentOptionValueInt > 1 ? selectedPaymentOptionValueInt * 2 : 0;
    const paymentValueWithDiscount = paymentValue - discount;

    setPaymentValue(paymentValueWithDiscount.toFixed(2));
    setDiscountString(discount.toFixed(2));
  }, [selectedPaymentOptionValue]);

  const paypalApi = new PaypalApi();

  const createOrder = async () => {
    try {
      const orderID = await paypalApi.createOrder(paymentValue);
      console.log("orderID", orderID);
      return orderID;
    } catch (error) {
      console.error("Failed to create order:", error);
      throw error;
    }
  };

  const onApprove = async (data: { orderID: string }) => {
    setIsProcessing(true);
    try {
      // Step 1: Capture the PayPal payment
      console.log("orderId", data.orderID);
      console.log("user", user);
      console.log("paymentValue", paymentValue);
      const captureDetails = await paypalApi.captureOrder(
        data.orderID,
        user.email,
        paymentValue
      );

      console.log({ captureDetails });

      // Step 2: Update UI to show success message
      setStatus({
        status: "Success",
        message: "Payment successful! You are now a Premium member!",
        icon: CheckCircle,
      });
      setIsAlertOpen(true);

      // Step 3: Send a payment alert email
      try {
        await appAlerts.sendNewPaymentAlert(
          user.email,
          `Payment value: $${paymentValue}`
        );
      } catch (error) {
        console.error("Error sending payment alert:", error);
      }

      // Step 4: Redirect to home page after 3 seconds
      setTimeout(() => {
        router.push("/");
      }, 3000);
    } catch (error) {
      console.error("Failed to capture payment:", error);

      // Update UI to show failure message
      setStatus({
        status: "Fail",
        message: "There was an error processing the payment. Please try again.",
        bg: "bg-red-500",
        icon: XCircle,
      });
      setIsAlertOpen(true);

      // Hide the alert after 5 seconds
      setTimeout(() => {
        setIsAlertOpen(false);
      }, 5000);
    }
    setIsProcessing(false);
  };

  return (
    <PaypalProvider>
      <div className="min-h-screen bg-dark-background p-2 flex items-center justify-center">
        <div className="w-full max-w-2xl font-stix text-dark-foreground bg-dark-background rounded-xl shadow-xl p-2">
          <div className="text-center mb-6">
            <Link href="/" className="text-2xl">
              <span className="text-dark-secondary ml-2">AI</span>
              <span>Read</span>
            </Link>
            <h1 className="text-xl mb-1">Upgrade to Premium</h1>
            <p className="text-sm text-dark-foreground/70">
              Get unlimited access to all features
            </p>
          </div>

          <div
            className={`bg-dark-background rounded-xl shadow-lg md:p-6 p-4 flex flex-col border-2 ${
              plan?.name === "Premium"
                ? "border-dark-secondary shadow-dark-secondary/20"
                : "border-dark-secondary/20"
            }`}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-dark-secondary/10 flex items-center justify-center">
                <span className="text-dark-secondary text-lg">★</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-dark-foreground">
                  {plan?.name}
                </h3>
                <p className="text-xl font-bold text-dark-secondary">
                  {plan?.price}
                </p>
              </div>
            </div>

            <div className="flex-grow space-y-3 mb-4">
              {plan?.features.map((feature, idx) => (
                <p
                  key={idx}
                  className="flex items-center text-sm text-dark-foreground/80"
                >
                  <span className="mr-2 text-dark-secondary">•</span>
                  {feature}
                </p>
              ))}
            </div>
            {user && user.email.trim() !== "" ? (
              <div className="bg-dark-background/50 text-dark-foreground rounded-lg p-3">
                <div className="relative">
                  <div className="relative z-50 mb-4">
                    <div className="flex flex-row space-x-2">
                      <div className="w-[60%]">
                        <CustomSelect
                          options={paymentOptions}
                          label={""}
                          selectedOption={selectedPaymentOptionValue}
                          onChange={setSelectedPaymentOptionValue}
                          disabled={isProcessing}
                        />
                      </div>

                      <div className="w-[20%] h-11 mt-2 bg-dark-secondary/80 p-3 rounded-lg border border-dark-secondary/20 flex items-center justify-center">
                        <span className="text-dark-foreground font-medium">
                          <div className="hidden md:flex text-sm">Discount</div>
                          {formatCurrency(discountString)}
                        </span>
                      </div>
                      <div className="w-[20%] h-11 mt-2 bg-dark-secondary/80 p-3 rounded-lg border border-dark-secondary/20 flex items-center justify-center">
                        <span className="text-dark-foreground font-medium">
                          <div className="hidden md:flex md:text-sm ">
                            Final Price
                          </div>
                          {formatCurrency(paymentValue)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="relative z-40">
                    <PayPalButtons
                      key={paymentValue}
                      createOrder={createOrder}
                      onApprove={onApprove}
                      onError={(err) => {
                        console.error("PayPal Checkout Error", err);
                        setStatus({
                          status: "Fail",
                          message:
                            "An error occurred during the transaction. Please try again.",
                          bg: "bg-red-500",
                          icon: XCircle,
                        });
                        setIsAlertOpen(true);
                      }}
                      style={{
                        layout: "vertical",
                        color: "gold",
                        shape: "rect",
                        label: "pay",
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-10 flex flex-col items-center justify-center ">
                <Loader className="animate-spin text-2xl text-dark-secondary" />
              </div>
            )}
          </div>
        </div>
        {isAlertOpen && (
          <Alert
            title={status?.status}
            message={status?.message}
            bg={status?.bg}
            icon={status?.icon}
            onClose={() => setIsAlertOpen(false)}
          />
        )}
      </div>
    </PaypalProvider>
  );
};

export default Payment;
