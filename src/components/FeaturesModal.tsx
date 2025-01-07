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
  const isPremium = user?.isPremium;

  const handleClick = (planName: string) => {
    if (planName === "Premium") {
      user ? router.push("/payment") : router.push("/login?redirect=/payment");
    }
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

        <div className="grid sm:grid-cols-2 gap-6">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-dark-background rounded-xl shadow-lg p-4 md:p-6 flex flex-col border-2 
            ${
              plan.name === "Premium"
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

              {isPremium ? (
                plan.name === "Premium" ? (
                  <button
                    className="w-full py-2 rounded-lg text-sm font-medium bg-dark-secondary/10 text-dark-secondary cursor-auto disabled"
                    disabled
                  >
                    Current Plan
                  </button>
                ) : (
                  <p className="text-center text-sm text-dark-secondary/80">
                    Free plan is not available for downgrade
                  </p>
                )
              ) : (
                <button
                  className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                    plan.name === "Premium"
                      ? "bg-dark-secondary text-white hover:bg-dark-secondary/90"
                      : "bg-dark-secondary/10 text-dark-secondary cursor-auto disabled"
                  }`}
                  onClick={() => handleClick(plan.name)}
                  disabled={plan.name !== "Premium"}
                >
                  {plan.name === "Premium" ? "Upgrade Now" : "Current Plan"}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturesModal;
