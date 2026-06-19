import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in visualization:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center p-6 border border-dashed border-destructive/30 rounded-xl bg-destructive/5 text-center min-h-[200px]">
          <AlertTriangle className="w-8 h-8 text-destructive mb-2 opacity-80 animate-pulse" />
          <p className="text-sm font-semibold text-destructive">Failed to render visualization</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">
            An error occurred while loading this chart. Try clearing your state or checking data consistency.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
