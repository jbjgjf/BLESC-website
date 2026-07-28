"use client";

import { Component, type ReactNode } from "react";

/**
 * Static stand-in for the shader, in the site's own palette. Rendered
 * permanently *beneath* the canvas rather than swapped in on failure: if the
 * WebGL context never initialises the canvas simply stays transparent and
 * this shows through, so there is no error state to track and no flash.
 */
export function WebGLFallback({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={className}
      style={{
        backgroundColor: "var(--color-bg)",
        // Built from tokens so the same gradient works on either ground —
        // it is also what stands in for the shader in light mode.
        backgroundImage: [
          "radial-gradient(120% 80% at 68% 30%, rgba(133,192,237,0.20), transparent 60%)",
          "radial-gradient(90% 70% at 20% 78%, rgba(133,192,237,0.12), transparent 62%)",
          "linear-gradient(180deg, var(--color-bg-alt), var(--color-bg))",
        ].join(","),
      }}
    />
  );
}

type Props = { children: ReactNode; fallback: ReactNode };

/**
 * Catches render-time failures from the WebGL layer so a driver or context
 * problem degrades to the static gradient instead of taking the page down.
 */
export class WebGLErrorBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error("SilkAurora: WebGL layer failed, using static fallback.", error);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
