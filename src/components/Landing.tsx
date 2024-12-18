import React from "react";

interface LandingProps {
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Landing: React.FC<LandingProps> = ({ onFileChange }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-dark-background p-2">
      <div className="bg-dark-background p-2 rounded-lg shadow-lg w-full max-w-lg">
        <div className="text-center mb-6 -mt-16">
          <img src="/images/Fireball.svg" alt="" className="h-70 w-70" />

          <h1 className="text-3xl font-bold text-dark-foreground mb-2">
            Welcome to AI-Read
          </h1>
          <p className="text-lg text-dark-foreground">
            Upload your PDF to get started.
          </p>
        </div>

        <label
          htmlFor="file-upload"
          className="cursor-pointer block text-center py-3 px-6 bg-dark-primary hover:bg-dark-secondary duration-300 text-dark-foreground font-semibold rounded-lg shadow-md transition"
        >
          <span>Upload a PDF</span>
        </label>

        <input
          id="file-upload"
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={onFileChange}
        />
      </div>
    </div>
  );
};

export default Landing;
