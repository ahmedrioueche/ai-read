"use client";
import React, { useState } from "react";
import { Mail, Loader, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const { success, error: resetError } = await resetPassword(email);
      if (success) {
        setSubmitted(true);
      } else {
        setError(resetError?.message || "Failed to send reset email. Please try again.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#030303] flex items-center justify-center p-4 relative overflow-hidden font-inter">
      {/* Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-dark-secondary/10 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-dark-primary/10 blur-[120px] rounded-full" />

      <div className="w-full max-w-[500px] bg-white/[0.02] border border-white/[0.05] backdrop-blur-2xl rounded-[32px] overflow-hidden shadow-2xl relative z-10 p-8 lg:p-12">
        
        <Link href="/login" className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-8 group">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to login</span>
        </Link>

        {submitted ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Check your email</h2>
            <p className="text-gray-400 leading-relaxed mb-8">
              We've sent a password reset link to <span className="text-white font-semibold">{email}</span>. Please check your inbox.
            </p>
            <button 
              onClick={() => setSubmitted(false)}
              className="text-dark-secondary font-bold hover:underline"
            >
              Didn't receive the email? Try again
            </button>
          </div>
        ) : (
          <>
            <div className="mb-10 text-center md:text-left">
              <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
              <p className="text-gray-400">Enter the email associated with your account and we'll send you a link to reset your password.</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2 ml-1">Email Address</label>
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

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-dark-secondary text-white font-bold py-4 rounded-2xl shadow-xl shadow-orange-500/20 hover:bg-orange-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? <Loader className="w-5 h-5 animate-spin" /> : (
                  <span>Send Reset Link</span>
                )}
              </button>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm py-3 px-4 rounded-xl text-center">
                  {error}
                </div>
              )}
            </form>
          </>
        )}
      </div>
    </div>
  );
}
