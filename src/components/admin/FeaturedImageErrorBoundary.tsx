"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string | null;
}

export class FeaturedImageErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error.message || "Failed to render Featured Image component.",
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[FeaturedImageErrorBoundary caught error]:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, errorMessage: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-[var(--bg-surface)] border border-red-500/30 rounded-lg space-y-3">
          <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Featured Image Component Error</span>
          </div>
          <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
            An error occurred while rendering the featured image uploader. The rest of your article editor is safe and unaffected.
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-[var(--bg-base)] border border-[var(--border-subtle)] text-xs font-medium text-[var(--text-primary)] hover:text-[var(--accent-teal)] transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Image Area</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default FeaturedImageErrorBoundary;
