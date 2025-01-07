import { Loader } from "lucide-react";
import React from "react";

const LoadingPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center text-dark-foreground justify-center min-h-screen bg-dark-background transition-colors duration-300">
      {/* Loader Animation */}
      <Loader className="animate-spin rounded-full h-16 w-16 border-t-4 border-light-secondary dark:border-dark-secondary border-opacity-50 mb-4" />

      {/* Loading Text */}
      <h1 className="text-3xl font-dancing text-dark-foreground mb-2">
        Loading...
      </h1>

      {/* Quick Engaging Text */}
      <p className="text-lg font-stix text-dark-foreground text-opacity-70">
        Preparing something amazing for you!
      </p>
    </div>
  );
};

export default LoadingPage;
