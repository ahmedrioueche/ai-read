"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = "" }) => {
  const router = useRouter();

  const handleLogoClick = (e: React.MouseEvent) => {
    // Next.js Link usually handles this, but we add an explicit router push
    // as a fallback for cases where Link might be intercepted or fail.
    e.preventDefault();
    router.push("/");
  };

  return (
    <Link
      href="/"
      onClick={handleLogoClick}
      className={`flex items-center space-x-3 group cursor-pointer !cursor-pointer transition-all duration-300 relative z-[100] ${className}`}
      style={{ cursor: "pointer" }}
    >
      <div className="flex items-center space-x-3 !cursor-pointer">
        <div className="transition-transform duration-300 group-hover:scale-110 flex items-center !cursor-pointer">
          <img
            src="/images/logo.png"
            alt="Logo"
            className="h-8 w-auto object-contain !cursor-pointer"
            style={{ cursor: "pointer" }}
          />
        </div>
        <div
          className="text-2xl font-bold font-dancing transition-colors duration-300 !cursor-pointer"
          style={{ cursor: "pointer" }}
        >
          <span className="text-dark-secondary">AI</span>
          <span className="text-white">Read</span>
        </div>
      </div>
    </Link>
  );
};

export default Logo;
