"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle, XCircle, Loader } from "lucide-react";
import Alert from "@/components/ui/Alert";
import { useAuth } from "@/context/AuthContext";
import { UserApi } from "@/apis/userApi";
import { useRouter } from "next/navigation";

const page: React.FC = () => {
  const { user } = useAuth();
  const userApi = new UserApi();
  const router = useRouter();
  const [subscriptionDetails, setSubscriptionDetails] = useState<{
    plan: string;
    lastPaymentDate: Date;
    subExpirationDate: Date;
    lastPaymentValue: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<{
    status: string;
    message: string;
    bg?: string;
    icon?: React.ElementType;
  }>();
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const handleCancelSubscription = async () => {
    try {
      setIsLoading(true);
      await userApi.updateUser(user?.email, { plan: "Free" });
      setStatus({
        status: "Success",
        message: "Your subscription has been canceled.",
        bg: "bg-green-500",
        icon: CheckCircle,
      });
      setIsAlertOpen(true);
      setTimeout(() => {
        router.push("/");
      }, 3000);
    } catch (error) {
      console.error("Failed to cancel subscription:", error);
      setStatus({
        status: "Error",
        message: "Failed to cancel subscription. Please try again.",
        bg: "bg-red-500",
        icon: XCircle,
      });
      setIsAlertOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-background p-4 flex items-center justify-center text-dark-foreground">
      <div className="w-full max-w-2xl bg-dark-background/80 rounded-xl shadow-lg p-6 border-2 border-dark-secondary/20">
        <div className="text-center mb-6">
          <Link href="/" className="text-2xl font-stix">
            <span className="text-dark-secondary">AI</span>
            <span>Read</span>
          </Link>
          <h1 className="text-xl mt-2">Manage Subscription</h1>
          <p className="text-sm mt-2 ">
            View and manage your subscription details
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <Loader className="animate-spin text-dark-secondary" size={32} />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-dark-background/50 rounded-lg p-4">
              <h2 className="text-lg font-bold mb-4">Subscription Details</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="">Plan:</span>
                  <span className="font-medium ">
                    {subscriptionDetails?.plan || "Free"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="">Last Payment Date:</span>
                  <span className="font-medium ">
                    {subscriptionDetails?.lastPaymentDate.toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-foreground/80">
                    Subscription Expiration:
                  </span>
                  <span className="font-medium text-dark-foreground">
                    {subscriptionDetails?.subExpirationDate.toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="">Last Payment Amount:</span>
                  <span className="font-medium ">
                    ${subscriptionDetails?.lastPaymentValue.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-dark-background/50 rounded-lg p-4">
              <h2 className="text-lg font-bold mb-4">Actions</h2>
              <div className="space-y-3">
                <button
                  className="w-full bg-dark-secondary/80  py-2 rounded-lg hover:bg-dark-secondary transition-colors"
                  onClick={() => router.push("/payment")}
                >
                  Update Payment Method
                </button>
                <button
                  className="w-full bg-red-500/80 text-dark-foreground py-2 rounded-lg hover:bg-red-600 transition-colors"
                  onClick={handleCancelSubscription}
                  disabled={isLoading}
                >
                  Cancel Subscription
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {isAlertOpen && (
        <Alert
          title={status?.status}
          message={status?.message}
          bg={status?.bg}
          onClose={() => setIsAlertOpen(false)}
        />
      )}
    </div>
  );
};

export default page;
