import { Component, type ReactNode } from "react";
import { captureError, track } from "@/lib/observability";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
    captureError(error, { source: "ErrorBoundary", componentStack: errorInfo.componentStack });
    track("error_boundary_shown", { message: error?.message?.slice(0, 120) });
    // Only redirect to credits if the error is actually credit-related.
    try {
      const msg = error?.message ?? "";
      if (
        /\b(credit|credits|insufficient|out of credits?|payment required|402|top ?up|recharge)\b/i.test(msg) &&
        typeof window !== "undefined" &&
        !window.location.pathname.startsWith("/app/credits")
      ) {
        window.location.replace("/app/credits");
      }
    } catch { /* ignore */ }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center max-w-md px-8">
            <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-display font-bold text-foreground mb-3">
              Something went wrong
            </h2>
            <p className="text-sm text-muted-foreground font-body mb-6 leading-relaxed">
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-6 py-3 rounded-full bg-primary text-primary-foreground font-display text-sm hover:scale-105 transition-all"
            >
              Reload App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}