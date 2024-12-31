"use client";
import React from "react";
import { LogIn, Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="min-h-screen bg-dark-background flex">
      {/* Left Section */}
      <div className="hidden md:flex w-1/2 bg-dark-background items-center justify-center">
        <img src="/images/login.svg" className="w-3/4 h-auto" />{" "}
        {/* Replace with your illustration */}
      </div>

      {/* Right Section */}
      <div className="flex flex-col justify-center py-12 px-6 lg:px-8 w-full md:w-1/2">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="py-8 px-4 sm:rounded-xl">
            <form className="space-y-6" onSubmit={handleLogin}>
              <div className="flex flex-row justify-center md:text-3xl text-4xl font-dancing text-dark-foreground mb-6">
                Welcome Back To
                <span className="text-dark-secondary ml-2">AI</span>
                <span>Read</span>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-dark-foreground"
                >
                  Email
                </label>
                <div className="mt-1 relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="appearance-none block w-full px-3 py-2 pl-10 bg-dark-background border border-dark-accent/70 rounded-lg shadow-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-dark-primary focus:border-transparent text-dark-foreground"
                    placeholder="you@example.com"
                  />
                  <Mail className="h-5 w-5 text-dark-secondary absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-dark-foreground"
                >
                  Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="appearance-none block w-full px-3 py-2 pl-10 bg-dark-background border border-dark-accent/70 rounded-lg shadow-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-dark-primary focus:border-transparent text-dark-foreground"
                    placeholder="••••••••"
                  />
                  <Lock className="h-5 w-5 text-dark-secondary absolute left-3 top-2.5" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 bg-dark-background border rounded text-dark-primary focus:ring-dark-primary"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-dark-foreground"
                  >
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a
                    href="#"
                    className="font-medium text-dark-primary hover:text-dark-accent transition-colors"
                  >
                    Forgot password?
                  </a>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-dark-foreground bg-dark-primary hover:bg-dark-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-background focus:ring-dark-primary transition-all duration-200"
                >
                  <LogIn className="h-5 w-5 mr-2" />
                  Sign in
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-dark-accent/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-dark-background text-dark-secondary">
                    New here?
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <a
                  href="/register"
                  className="w-full flex justify-center py-2.5 px-4 border hover:bg-dark-secondary border-dark-accent/70 rounded-lg shadow-sm text-sm font-medium text-dark-foreground bg-transparent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-background focus:ring-dark-accent transition-all duration-200"
                >
                  Create an account
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
