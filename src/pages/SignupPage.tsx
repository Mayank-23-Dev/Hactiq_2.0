// src/pages/SignupPage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link, Navigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { Loader2, AlertCircle, Home } from "lucide-react";

export default function SignupPage() {
  const { signup, loginWithGoogle, user, loading, isLoading } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono select-none">Loading...</p>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validations
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await signup(name, email, password);
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Signup failed. Please try again.");
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    try {
      await loginWithGoogle();
      navigate("/");
    } catch (err: any) {
      setError("Google Sign-In failed. Please try again.");
    }
  };

  return (
    <div className="relative min-h-screen text-white flex items-center justify-center p-4 overflow-hidden">
      {/* Home button absolute top-left */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.08] active:bg-white/[0.12] text-xs font-medium text-gray-400 hover:text-white transition-all cursor-pointer select-none"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Home</span>
      </button>

      <div className="fixed inset-0 bg-black -z-20" />
      {/* Subtle Monochrome Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-[140px] pointer-events-none" />

      {/* Signup Card */}
      <div className="relative w-full max-w-md bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-8 shadow-2xl flex flex-col transition-all duration-300 hover:border-white/[0.15]">
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div 
            onClick={() => navigate("/")}
            className="mb-4 flex items-center justify-center w-12 h-12 rounded-xl bg-white/[0.02] border border-white/10 shadow-inner cursor-pointer"
          >
            <img src="/logo.svg" alt="Hactiq Logo" className="w-8 h-8 object-contain" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Create Account
          </h2>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-200 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full py-2.5 px-4 bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.12] disabled:opacity-50 text-white border border-white/10 text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
          )}
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-white/[0.08]"></div>
          <span className="mx-4 text-xs font-semibold tracking-widest text-gray-500 uppercase">OR</span>
          <div className="flex-grow border-t border-white/[0.08]"></div>
        </div>

        {/* Email Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              required
              disabled={isLoading}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Chen"
              className="w-full px-3 py-2 bg-white/[0.02] border border-white/10 rounded-lg text-sm text-white placeholder-gray-700 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              Email
            </label>
            <input
              type="email"
              required
              disabled={isLoading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full px-3 py-2 bg-white/[0.02] border border-white/10 rounded-lg text-sm text-white placeholder-gray-700 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              disabled={isLoading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 bg-white/[0.02] border border-white/10 rounded-lg text-sm text-white placeholder-gray-700 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              Confirm Password
            </label>
            <input
              type="password"
              required
              disabled={isLoading}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 bg-white/[0.02] border border-white/10 rounded-lg text-sm text-white placeholder-gray-700 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 bg-white hover:bg-gray-200 disabled:bg-white/50 disabled:cursor-not-allowed text-black text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Create Account</span>
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-8 text-center text-xs text-gray-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-white hover:underline font-semibold transition-colors"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
