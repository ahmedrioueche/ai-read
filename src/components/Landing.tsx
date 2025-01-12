import { dict } from "@/utils/dict";
import React from "react";
interface LandingProps {
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
const Landing: React.FC<LandingProps> = ({ onFileChange }) => {
  const language = "en";
  const text = dict[language];
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-dark-background p-2">
      {" "}
      <div className="bg-dark-background p-2 rounded-lg shadow-lg w-full max-w-lg">
        {" "}
        <div className="text-center mb-6 -mt-32">
          {" "}
          <img
            src="/images/reading-story-set.svg"
            alt=""
            className="h-70 w-70"
          />{" "}
          <div className="flex flex-row md:text-5xl text-4xl font-dancing text-dark-foreground mb-4">
            {" "}
            {text.App.welcomeTo}{" "}
            <span className="text-dark-secondary ml-2">AI</span>{" "}
            <span>Read</span>{" "}
          </div>{" "}
          <p className="text-lg text-dark-foreground">
            {" "}
            {text.Actions.uploadYourPdfToGetstarted}{" "}
          </p>{" "}
        </div>{" "}
        <label
          htmlFor="file-upload"
          className="cursor-pointer block text-center py-3 px-6 bg-dark-primary hover:bg-dark-secondary duration-300 text-dark-foreground font-semibold rounded-lg shadow-md transition"
        >
          {" "}
          <span>{text.Actions.openPdf}</span>{" "}
        </label>{" "}
        <input
          id="file-upload"
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={onFileChange}
        />{" "}
      </div>{" "}
    </div>
  );
};
export default Landing;
