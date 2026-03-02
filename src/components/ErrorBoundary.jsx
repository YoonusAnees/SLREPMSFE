import React from "react";
import { useUIStore } from "../store/ui.store";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error) {
    try {
      useUIStore.getState().toast("error", "UI crashed. Please refresh.");
    } catch {}
    console.error(error);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen grid place-items-center bg-gray-50 p-4">
          <div className="bg-white border rounded-2xl p-6 max-w-lg w-full">
            <h1 className="text-xl font-semibold">Something went wrong</h1>
            <pre className="text-xs bg-gray-50 border rounded-xl p-3 mt-3 overflow-auto">
              {String(this.state.error)}
            </pre>
            <button
              className="mt-4 px-4 py-2 rounded-xl bg-black text-white"
              onClick={() => window.location.reload()}
            >
              Refresh
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
