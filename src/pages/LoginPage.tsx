import React, { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "sonner";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("alex@company.co");
  const [password, setPassword] = useState("password");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }
    setLoading(true);
    // Simulate API request delay
    setTimeout(() => {
      login();
      toast.success("Welcome back, Alex!");
      navigate("/", { replace: true });
      setLoading(false);
    }, 500);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="Hactiq Logo" className="h-10 w-10 dark:invert" />
            <span className="text-xl font-bold tracking-tight">Hactiq</span>
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">Login to your account</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email below to login to your workspace
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="alex@company.co"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-input-background"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-input-background"
            />
          </div>
          <Button type="submit" className="w-full bg-foreground text-background hover:bg-foreground/90" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>

        <div className="text-center text-xs text-muted-foreground">
          Demo login. Simply click the "Login" button to authenticate.
        </div>
      </div>
    </div>
  );
}
