import { LucideIcon, X } from "lucide-react";
import React from "react";

interface AlertProps {
  title: string | undefined;
  message: string | undefined;
  bg?: string;
  icon?: LucideIcon;
  onClose: () => void;
}

const Alert: React.FC<AlertProps> = ({
  title,
  message,
  bg,
  icon: Icon,
  onClose,
}) => {
  return (
    <div
      className={`fixed bottom-5 z-[1000000] left-1/2 transform -translate-x-1/2 ${
        bg ? bg : "bg-dark-secondary"
      } text-dark-foreground p-4 rounded-lg shadow-lg w-11/12 max-w-md font-stix animate-fade-in`}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="flex flex-row">
            {Icon && (
              <Icon
                className={`w-5 h-5 mr-2 mt-0.5 ${
                  title === "Loading" ? "animate-spin" : ""
                }`}
              />
            )}
            <h4 className="font-bold text-lg">{title}</h4>
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-sm mt-1">{message}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className={`p-2 rounded-full ${
            bg ? bg : "bg-dark-secondary"
          }bg-dark-secondary hover:bg-light-secondary/100 transition-colors duration-300 text-dark-foreground`}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default Alert;
