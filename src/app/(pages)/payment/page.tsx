"use client";
import React, { useState } from "react";
import { PayPalButtons } from "@paypal/react-paypal-js";
import PaypalProvider from "@/components/PaypalProvider";
import { plans } from "@/utils/constants";
import Link from "next/link";
import { UserApi } from "@/apis/userApi";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { User } from "@prisma/client";
import Alert from "@/components/ui/Alert";
import { CheckCircle, Loader, LucideIcon, XCircle } from "lucide-react";

const plan = plans.find((plan) => plan.name === "Premium");

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

  const handleApprove = async (orderId: string) => {
    setStatus({
      status: "Loading",
      message: "Please Wait until processing is completed",
      bg: "bg-blue-500",
      icon: Loader,
    });
    setIsAlertOpen(true);

    const userData: Partial<User> = {
      isPremium: true,
      lastPaymentDate: new Date(),
    };

    try {
      await userApi.updateUserData(user?.email, userData);
      setStatus({
        status: "Success",
        message: "Payment successful! You are now a Premium member!.",
        icon: CheckCircle,
      });
      setIsAlertOpen(true);
      setTimeout(() => {
        router.push("/");
      }, 3000);
    } catch (e) {
      console.log("Failed to update user data", e);
      setStatus({
        status: "Fail",
        message: "There was an error processing the payment. Please try again.",
        bg: "bg-red-500",
        icon: XCircle,
      });
      setIsAlertOpen(true);
      setTimeout(() => {
        setIsAlertOpen(false);
      }, 5000);
    }
  };

  return (
    <PaypalProvider>
      <div className="min-h-screen bg-dark-background p-3 flex items-center justify-center">
        <div className="w-full max-w-3xl font-stix text-dark-foreground bg-dark-background rounded-xl shadow-xl p-2">
          <div className="text-center mb-8">
            <Link href="/" className="text-3xl">
              <span className="text-dark-secondary ml-2">AI</span>
              <span>Read</span>
            </Link>
            <h1 className="text-2xl mb-2">Upgrade to Premium</h1>
            <p className="text-dark-foreground/70">
              Get unlimited access to all features
            </p>
          </div>

          <div
            className={`bg-dark-background rounded-xl shadow-lg md:p-8 p-6 flex flex-col border-2 
              ${
                plan?.name === "Premium"
                  ? "border-dark-secondary shadow-dark-secondary/20"
                  : "border-dark-secondary/20"
              }`}
          >
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-dark-secondary/10 flex items-center justify-center">
                <span className="text-dark-secondary text-xl">★</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-dark-foreground">
                  {plan?.name}
                </h3>
                <p className="text-2xl font-bold text-dark-secondary">
                  {plan?.price}
                </p>
              </div>
            </div>

            <div className="flex-grow space-y-4 mb-6">
              {plan?.features.map((feature, idx) => (
                <p
                  key={idx}
                  className="flex items-center text-dark-foreground/80"
                >
                  <span className="mr-3 text-dark-secondary">•</span>
                  {feature}
                </p>
              ))}
            </div>

            <div className="bg-dark-background/50 rounded-lg p-4">
              <PayPalButtons
                createOrder={(data, actions) => {
                  return actions.order.create({
                    purchase_units: [
                      {
                        amount: { value: "10.00" },
                      },
                    ],
                  });
                }}
                onApprove={(data, actions) => {
                  return actions.order
                    .capture()
                    .then(
                      (details: { payer: { name: { given_name: any } } }) => {
                        const orderId = data.orderID || "";
                        handleApprove(orderId);
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
