// src/pages/AuthActionPage.tsx
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router";
import { 
  applyActionCode, 
  confirmPasswordReset, 
  verifyPasswordResetCode 
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { Loader2, CheckCircle2, AlertCircle, ShieldAlert } from "lucide-react";

export default function AuthActionPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const mode = searchParams.get("mode");
  const oobCode = searchParams.get("oobCode");

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Password reset specific states
  const [email, setEmail] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    if (!oobCode) {
      setError("Invalid action code or link. Please check your email link again.");
      setLoading(false);
      return;
    }

    if (mode === "verifyEmail") {
      // Process email verification
      applyActionCode(auth, oobCode)
        .then(() => {
          setSuccess("Email Verified — Your account is now active.");
          setLoading(false);
          // Auto-redirect to /today after 2 seconds
          const timer = setTimeout(() => {
            navigate("/today");
          }, 2000);
          return () => clearTimeout(timer);
        })
        .catch((err: any) => {
          setError(err.message || "Failed to verify your email. The link may have expired or been used already.");
          setLoading(false);
        });
    } else if (mode === "resetPassword") {
      // Verify password reset code and retrieve email
      verifyPasswordResetCode(auth, oobCode)
        .then((userEmail) => {
          setEmail(userEmail);
          setLoading(false);
        })
        .catch((err: any) => {
          setError(err.message || "Invalid or expired password reset link.");
          setLoading(false);
        });
    } else {
      setError("Unsupported action mode.");
      setLoading(false);
    }
  }, [mode, oobCode, navigate]);

  const handlePasswordResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oobCode) return;

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setResetLoading(true);
    setError(null);

    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setSuccess("Password reset successful. You can now login with your new password.");
    } catch (err: any) {
      setError(err.message || "Failed to reset password. The link may have expired.");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen text-white flex items-center justify-center p-4 overflow-hidden">
      <div className="fixed inset-0 bg-black -z-20" />
      {/* Subtle Monochrome Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-[140px] pointer-events-none" />

      {/* Card Wrapper */}
      <div className="relative w-full max-w-md bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-8 shadow-2xl flex flex-col transition-all duration-300 hover:border-white/[0.15]">
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div 
            onClick={() => navigate("/")} 
            className="mb-4 flex items-center justify-center w-12 h-12 rounded-xl bg-white/[0.02] border border-white/10 shadow-inner cursor-pointer"
          >
            <img src="/logo.svg" alt="Hactiq Logo" className="w-8 h-8 object-contain invert" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            {mode === "verifyEmail" ? "Verify Email" : mode === "resetPassword" ? "Reset Password" : "Account Verification"}
          </h2>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-mono">Processing code...</p>
          </div>
        )}

        {/* Success Screen */}
        {!loading && success && (
          <div className="flex flex-col items-center text-center py-6 space-y-5">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 animate-in zoom-in duration-300" />
            <p className="text-sm text-gray-300">{success}</p>
            {mode === "verifyEmail" ? (
              <button
                onClick={() => navigate("/today")}
                className="w-full mt-2 py-3 bg-white hover:bg-gray-200 text-black text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer text-center block"
              >
                Continue to Dashboard
              </button>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="w-full mt-2 py-3 bg-white hover:bg-gray-200 text-black text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer text-center block"
              >
                Go to Login
              </button>
            )}
          </div>
        )}

        {/* Error Screen */}
        {!loading && !success && error && (
          <div className="flex flex-col items-center text-center py-6 space-y-5">
            <ShieldAlert className="w-16 h-16 text-red-500 animate-in zoom-in duration-300" />
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-200 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
            {mode === "verifyEmail" ? (
              <Link
                to="/register"
                className="w-full mt-2 py-3 bg-white hover:bg-gray-200 text-black text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer text-center block"
              >
                Try signing up again
              </Link>
            ) : (
              <Link
                to="/login"
                className="w-full mt-2 py-3 bg-white hover:bg-gray-200 text-black text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer text-center block"
              >
                Back to Login
              </Link>
            )}
          </div>
        )}

        {/* Password Reset Form */}
        {!loading && !success && !error && mode === "resetPassword" && email && (
          <form onSubmit={handlePasswordResetSubmit} className="space-y-4">
            <div className="text-xs text-gray-400 mb-4 text-center">
              Resetting password for <span className="text-white font-medium">{email}</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                New Password
              </label>
              <input
                type="password"
                required
                disabled={resetLoading}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-3 py-2 bg-white/[0.02] border border-white/10 rounded-lg text-sm text-white placeholder-gray-700 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                disabled={resetLoading}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="w-full px-3 py-2 bg-white/[0.02] border border-white/10 rounded-lg text-sm text-white placeholder-gray-700 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={resetLoading || !newPassword || !confirmPassword}
              className="w-full mt-2 py-3 bg-white hover:bg-gray-200 disabled:bg-white/50 disabled:cursor-not-allowed text-black text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer"
            >
              {resetLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Reset Password</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
