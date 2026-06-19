import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { ThemeToggle } from "../components/ThemeToggle";

export default function LandingPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background text-foreground px-4 py-12">
      {/* Top right ThemeToggle to support dark mode switching cleanly */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="flex flex-col items-center max-w-md w-full text-center space-y-8">
        <img 
          src="/logo.svg" 
          alt="Hactiq Logo" 
          className="h-20 w-20 dark:invert transition-transform duration-300 hover:scale-105" 
        />
        
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Hactiq
          </h1>
          <h2 className="text-xl font-semibold text-muted-foreground">
            Smart Financial Workspace
          </h2>
          <p className="text-sm text-muted-foreground/80 max-w-xs mx-auto">
            Manage expenses, budgets, and financial insights.
          </p>
        </div>

        <div className="pt-4 w-full">
          <Button asChild size="lg" className="w-32 bg-foreground text-background hover:bg-foreground/90 font-medium">
            <Link to="/login">Login</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
