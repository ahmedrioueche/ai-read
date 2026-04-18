"use client";
import { useAuth } from "@/context/AuthContext";
import { AppAlerts } from "@/lib/appAlerts";
import { Loader, Lock, Mail, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";
import Logo from "@/components/Logo";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    error?: boolean;
    message?: string;
  }>({ success: false, error: false });
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const appAlerts = new AppAlerts();
  const { signUp, signInWithGoogle } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    setLoading(true);
    e.preventDefault();
    setResult({ success: false, error: false });

    try {
      const result = await signUp(email, password, {});
      if (result.data) {
        try {
          await appAlerts.sendNewUserAlert(email);
        } catch (e) {
          console.log("Error sending signup alert", e);
        }
        router.push(redirect || "/");
      } else {
        setResult({
          error: true,
          message:
            result.error?.message ||
            "Registration failed. Please try again with different details.",
        });
      }
    } catch (e) {
      console.log("Error signing up", e);
      setResult({
        error: true,
        message: "An unexpected error occurred during registration.",
      });
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle(redirect || "/");
    } catch (error) {
      console.error("Google login error", error);
      setResult({ error: true, message: "Failed to initialize Google login." });
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030303] flex items-center justify-center p-4 relative overflow-hidden font-inter">
      {/* Premium Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-dark-secondary/10 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-dark-primary/10 blur-[120px] rounded-full" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

      <div className="w-full max-w-[1100px] flex flex-col md:flex-row-reverse bg-white/[0.02] border border-white/[0.05] backdrop-blur-2xl rounded-[32px] overflow-hidden shadow-2xl relative z-10">
        {/* Branding/Visual Side */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-br from-dark-background via-[#080808] to-[#0a0a0a] p-12 flex-col justify-between relative">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,rgba(255,107,0,0.1),transparent)]" />

          <Logo />

          <div className="space-y-6">
            <h2 className="text-4xl lg:text-5xl font-bold leading-tight text-white tracking-tight">
              Join the{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
                elite readers.
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-md leading-relaxed">
              Unlock the full potential of your library with our advanced AI
              reading assistant.
            </p>
          </div>

          <div className="flex items-center space-x-4 text-xs uppercase tracking-widest text-gray-500 font-semibold italic">
            <span>AI Powered</span>
            <div className="w-12 h-[1px] bg-white/10" />
            <span>Smart Learning</span>
          </div>
        </div>

        {/* Form Side */}
        <div className="flex-1 p-8 lg:p-16 flex flex-col justify-center border-r border-white/5">
          <Logo className="md:hidden justify-center mb-8" />
          <div className="mb-10 text-center md:text-left">
            <h1 className="text-3xl font-bold text-white mb-2">
              Create Account
            </h1>
            <p className="text-gray-400">
              Join thousands of readers worldwide.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleRegister}>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2 ml-1">
                Email Address
              </label>
              <div className="relative group">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-11 py-3.5 text-white placeholder-gray-500 outline-none focus:border-dark-secondary/50 focus:ring-4 focus:ring-dark-secondary/10 transition-all"
                  placeholder="name@company.com"
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-dark-secondary transition-colors" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2 ml-1">
                Password
              </label>
              <div className="relative group">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-11 py-3.5 text-white placeholder-gray-500 outline-none focus:border-dark-secondary/50 focus:ring-4 focus:ring-dark-secondary/10 transition-all"
                  placeholder="At least 8 characters"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-dark-secondary transition-colors" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full bg-dark-secondary text-white font-bold py-4 rounded-2xl shadow-xl shadow-orange-500/20 hover:bg-orange-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span>Create Account</span>
                </>
              )}
            </button>

            {result.error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm py-3 px-4 rounded-xl text-center animate-shake">
                {result.message}
              </div>
            )}
          </form>

          <div className="my-8 flex items-center space-x-4">
            <div className="flex-1 h-[1px] bg-white/10" />
            <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">
              Or register with
            </span>
            <div className="flex-1 h-[1px] bg-white/10" />
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleGoogleLogin}
              disabled={loading || googleLoading}
              className="flex-1 bg-white/[0.03] border border-white/10 text-white font-semibold py-3.5 rounded-2xl hover:bg-white/[0.07] transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
            >
              {googleLoading ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span>Google</span>
                </>
              )}
            </button>
          </div>

          <p className="mt-10 text-center text-gray-400 text-sm">
            Already have an account?{" "}
            <Link
              href={redirect ? `/login?redirect=${redirect}` : "/login"}
              className="text-dark-secondary font-bold hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
