import { plans } from "@/utils/constants";
import { User } from "@prisma/client";
import { InfoIcon, X } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

const FeaturesModal: React.FC<{
  user: User;
  isOpen: boolean;
  onClose: () => void;
}> = ({ user, isOpen, onClose }) => {
  const router = useRouter();
  const currentPlan = user ? user.plan : "basic";

  const handleUpgrade = (plan: string) => {
    const planRoute = plan.toLowerCase();
    user.email.trim() !== ""
      ? router.push(`/payment/${planRoute}`)
      : router.push(`/login?redirect=/payment/${planRoute}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-dark-background w-full h-full max-h-[90vh] max-w-screen mx-0 sm:mx-4 rounded-none sm:rounded-xl shadow-2xl p-4 sm:p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex flex-row">
            <InfoIcon className="mr-2 text-dark-secondary" />
            <h2 className="-mt-0.5 text-xl font-stix text-dark-foreground">
              Features
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
          <div className="animate-fade-in">
            <h3 className="text-2xl font-dancing text-dark-secondary mb-2">
              Explore Our Plans 🌟
            </h3>
            <p className="text-dark-foreground/80">
              Choose the plan that best suits your needs and unlock amazing
              features!
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 grid-cols-1 gap-6">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-dark-background rounded-xl shadow-lg p-4 md:p-6 flex flex-col border-2 
            ${
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

              {/* Simplified Button Logic */}
              {currentPlan === plan.name.toLowerCase() ? (
                <button
                  className="w-full py-2 rounded-lg text-sm font-medium bg-dark-secondary/10 text-dark-secondary cursor-auto disabled"
                  disabled
                >
                  Current Plan
                </button>
              ) : plan.name.toLowerCase() === "pro" ||
                (plan.name.toLowerCase() !== "pro" &&
                  plan.name.toLowerCase() === "premium") ? (
                <button
                  className="w-full py-2 rounded-lg text-sm font-medium bg-dark-secondary text-white hover:bg-dark-secondary/90 transition-colors"
                  onClick={() => handleUpgrade(plan.name)}
                >
                  Upgrade Now
                </button>
              ) : (
                <p className="text-center text-sm text-dark-secondary/80">
                  Downgrade not available
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturesModal;
