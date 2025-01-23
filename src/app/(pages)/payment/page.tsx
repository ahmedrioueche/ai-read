"use client";
import React, { useEffect, useState } from "react";
import { PayPalButtons } from "@paypal/react-paypal-js";
import PaypalProvider from "@/components/PaypalProvider";
import { plans, pricing } from "@/utils/constants";
import Link from "next/link";
import { UserApi } from "@/apis/userApi";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { User } from "@prisma/client";
import Alert from "@/components/ui/Alert";
import { CheckCircle, Loader, LucideIcon, XCircle } from "lucide-react";
import { AppAlerts } from "@/lib/appAlerts";
import CustomSelect from "@/components/ui/CustomSelect";

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
  const userApi = new UserApi();
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

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(parseFloat(value));
  };

  useEffect(() => {
    console.log("selectedPaymentOptionLabel", selectedPaymentOptionValue);
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

  const handleApprove = async (orderId: string, paymentValue: string) => {
    setIsProcessing(true);
    setStatus({
      status: "Loading",
      message: "Please Wait until processing is completed",
      bg: "bg-blue-500",
      icon: Loader,
    });
    setIsAlertOpen(true);

    try {
      // Calculate subscription duration in months
      const subDuration = parseInt(selectedPaymentOptionValue, 10);

      // Calculate subscription expiration date
      const currentDate = new Date();
      const subExpirationDate = new Date(
        currentDate.setMonth(currentDate.getMonth() + subDuration)
      );

      // Prepare user data for update
      const userData: Partial<User> = {
        lastOrderId: orderId,
        plan: "premium",
        lastPaymentDate: new Date(),
        lastPaymentValue: parseFloat(paymentValue),
        subExpirationDate: subExpirationDate,
      };

      // Update user data in the database
      await userApi.updateUser(user?.email, userData);

      // Show success message
      setStatus({
        status: "Success",
        message: "Payment successful! You are now a Premium member!.",
        icon: CheckCircle,
      });
      setIsAlertOpen(true);

      // Send payment alert
      try {
        await appAlerts.sendNewPaymentAlert(
          user.email,
          `payment value: $${paymentValue}, subscription expiration date: ${subExpirationDate}`
        );
      } catch (e) {
        console.log("Error sending payment alert", e);
      }

      // Redirect to home page after 3 seconds
      setTimeout(() => {
        router.push("/");
      }, 3000);
    } catch (e) {
      console.log("Failed to update user data", e);

      // Send error alert
      try {
        await appAlerts.sendErrorAlert(
          "Failed to update user data after premium payment"
        );
      } catch (e) {
        console.log("Failed to send error alert", e);
        // we gotta try again
        try {
          await appAlerts.sendErrorAlert(
            "Failed to update user data after premium payment"
          );
        } catch (e) {
          console.log("Failed to send error alert", e);
        }
      }

      // Show error message
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
            className={`bg-dark-background rounded-xl shadow-lg md:p-6 p-4 flex flex-col border-2 
              ${
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
            <div className="bg-dark-background/50 rounded-lg p-3">
              <div className="relative">
                <div className="relative z-50 mb-4">
                  <div className="flex flex-row space-x-2">
                    {/* CustomSelect takes 60% width */}
                    <div className="w-[60%]">
                      <CustomSelect
                        options={paymentOptions}
                        label={""}
                        selectedOption={selectedPaymentOptionValue}
                        onChange={setSelectedPaymentOptionValue}
                        disabled={isProcessing}
                      />
                    </div>

                    {/* Discount Div takes 20% width */}
                    <div className="w-[20%] h-11 mt-2 bg-dark-secondary/80 p-3 rounded-lg border border-dark-secondary/20 flex items-center justify-center">
                      <span className="text-dark-foreground font-medium">
                        <div className="hidden md:flex text-sm">Discount</div>
                        {formatCurrency(discountString)}
                      </span>
                    </div>
                    {/* Payment Value Div takes 20% width */}
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
                    createOrder={(data, actions) => {
                      return actions.order.create({
                        purchase_units: [
                          {
                            amount: { value: paymentValue },
                          },
                        ],
                      });
                    }}
                    onApprove={(data, actions) => {
                      return actions.order
                        .capture()
                        .then(
                          (details: {
                            payer: { name: { given_name: any } };
                          }) => {
                            const orderId = data.orderID || "";
                            handleApprove(orderId, paymentValue);
                          }
                        );
                    }}
                    onError={(err) => {
                      console.error("PayPal Checkout Error", err);
                      alert("An error occurred during the transaction.");
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
