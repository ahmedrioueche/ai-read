import React from "react";
import { X, Zap, Clock, AlertTriangle } from "lucide-react";
import { plans } from "@/utils/constants";
import { User } from "@prisma/client";
import { useRouter } from "next/navigation";
import { calculateRemainingTime } from "@/utils/helper";

interface FreeTrialModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  isTrialActive: boolean; // Prop to differentiate between active and ended trial
  trialEndDate?: Date; // Optional prop for trial end date
}

const FreeTrialModal: React.FC<FreeTrialModalProps> = ({
  user,
  isOpen,
  onClose,
  isTrialActive,
  trialEndDate,
}) => {
  const router = useRouter();

  const handleUpgrade = (plan: string) => {
    const planRoute = plan.toLowerCase();
    user.email.trim() !== ""
      ? router.push(`/payment/${planRoute}`)
      : router.push(`/login?redirect=/payment/${planRoute}`);
  };

  if (!isOpen) return null;

  const remainingTime = isTrialActive
    ? calculateRemainingTime(trialEndDate!)
    : 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-dark-background w-full h-full max-h-[90vh] max-w-screen mx-0 sm:mx-4 rounded-none sm:rounded-xl shadow-2xl p-4 sm:p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            {/* Icon for the title */}
            {isTrialActive ? (
              <Zap className="w-8 h-8 text-dark-secondary animate-pulse" />
            ) : (
              <AlertTriangle className="w-8 h-8 text-dark-secondary" />
            )}
            <h2 className="text-xl font-stix text-dark-foreground">
              {isTrialActive ? "Free Trial Active" : "Free Trial Ended"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-dark-background hover:bg-dark-secondary transition-colors duration-300 text-dark-foreground"
          >
            <X size={16} />
          </button>
        </div>

        {/* Animated Welcome/Notification Section */}
        <div className="mb-8 text-center">
          {isTrialActive ? (
            <div className="animate-fade-in">
              <h3 className="text-2xl font-dancing text-dark-secondary mb-2">
                Enjoy Your Free Trial! 🎉
              </h3>
              <p className="text-dark-foreground/80">
                Explore all premium and pro features for{" "}
                <span className="font-bold text-dark-secondary">
                  {remainingTime}
                </span>
                . Upgrade now to keep them forever!
              </p>
            </div>
          ) : (
            <div className="animate-fade-in">
              <h3 className="text-2xl font-dancing text-dark-secondary mb-2">
                Your Free Trial Has Ended 😢
              </h3>
              <p className="text-dark-foreground/80">
                Don't worry! You can still enjoy the Basic features, or upgrade
                to Premium to unlock everything again.
              </p>
            </div>
          )}
        </div>

        {/* Features List */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-dark-background rounded-xl shadow-lg p-4 md:p-6 flex flex-col border-2 ${
                plan.name === "Pro"
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
                    {plan.name}
                  </h3>
                  <p className="text-xl font-bold text-dark-secondary">
                    {plan.price}
                  </p>
                </div>
              </div>

              <div className="flex-grow space-y-3 mb-4">
                {plan.features.map((feature, idx) => (
                  <p
                    key={idx}
                    className="flex items-center text-sm text-dark-foreground/80"
                  >
                    <span className="mr-2 text-dark-secondary">•</span>
                    {feature}
                  </p>
                ))}
              </div>

              {plan.name === "Premium" && (
                <button
                  className="w-full py-2 rounded-lg text-sm font-medium bg-dark-secondary text-white hover:bg-dark-secondary/90 transition-colors"
                  onClick={() => handleUpgrade("premium")}
                >
                  Upgrade to Premium
                </button>
              )}
              {plan.name === "Pro" && (
                <button
                  className="w-full py-2 rounded-lg text-sm font-medium bg-dark-secondary text-white hover:bg-dark-secondary/90 transition-colors"
                  onClick={() => handleUpgrade("pro")}
                >
                  Upgrade to Pro
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FreeTrialModal;
