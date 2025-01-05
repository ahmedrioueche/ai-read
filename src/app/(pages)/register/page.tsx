"use client";
import React, { useState } from "react";
import { UserPlus, Mail, Lock, Loader } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    error?: boolean;
    message?: string;
  }>({ success: false, error: false });
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  const handleRegister = async (e: React.FormEvent) => {
    setLoading(true);
    e.preventDefault();
    const result = await signUp(email, password, {});
    if (result.data) {
      router.push(redirect || "/");
    } else {
      setResult({ error: true, message: "Please try again later" });
    }
    setLoading(false);
  };

  const { signUp } = useAuth();

  return (
    <div className="min-h-screen bg-dark-background flex">
      {/* Left Section */}
      <div className="hidden md:flex w-1/2 bg-dark-background items-center justify-center">
        <img src="/images/register.svg" className="w-3/4 h-auto" />
      </div>

      {/* Right Section */}
      <div className="flex flex-col justify-center py-12 px-6 lg:px-8 w-full md:w-1/2">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="py-8 px-4 sm:rounded-xl">
            <form className="space-y-6" onSubmit={handleRegister}>
              <div className="flex flex-row justify-center md:text-3xl text-4xl font-dancing text-dark-foreground mb-6">
                Join
                <Link href="/">
                  <span className="text-dark-secondary ml-2">AI</span>
                  <span>Read</span>
                </Link>
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="appearance-none block w-full px-3 py-3 pl-10 bg-dark-background border border-dark-accent/70 rounded-lg shadow-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-dark-primary focus:border-transparent text-dark-foreground"
                    placeholder="you@example.com"
                  />
                  <Mail className="h-5 w-5 text-dark-secondary absolute left-3 top-3.5" />
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="appearance-none block w-full px-3 py-3 pl-10 bg-dark-background border border-dark-accent/70 rounded-lg shadow-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-dark-primary focus:border-transparent text-dark-foreground"
                    placeholder="••••••••"
                  />
                  <Lock className="h-5 w-5 text-dark-secondary absolute left-3 top-3.5" />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="mt-11 w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-dark-foreground bg-dark-primary hover:bg-dark-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-background focus:ring-dark-primary transition-all duration-200"
                >
                  {loading ? (
                    <Loader className="animate-spin" />
                  ) : (
                    <div className="flex flex-row">
                      <UserPlus className="h-5 w-5 mr-2" />
                      Sign up
                    </div>
                  )}
                </button>
              </div>
              <div className="flex justify-center text-red-500 font-stix">
                {result?.error && <div>Sign up failed, {result?.message}</div>}
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-dark-accent/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-dark-background text-dark-secondary">
                    Already have an account?
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <a
                  href={redirect ? "/login?redirect=/payment" : "/login"}
                  className="w-full flex justify-center py-3 px-4 border hover:bg-dark-secondary border-dark-accent/70 rounded-lg shadow-sm text-sm font-medium text-dark-foreground bg-transparent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-background focus:ring-dark-accent transition-all duration-200"
                >
                  Sign in
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
