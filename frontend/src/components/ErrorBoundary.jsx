import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error) {
    const msg = (error && error.message) || "";
    // Ignore cross-origin frame security errors — they come from embedded 3rd-party scripts.
    if (error && (error.name === "SecurityError" || /Blocked a frame|cross-origin frame/i.test(msg))) {
      return { hasError: false, message: "" };
    }
    return { hasError: true, message: msg };
  }

  componentDidCatch(error) {
    const msg = (error && error.message) || "";
    if (error && (error.name === "SecurityError" || /Blocked a frame|cross-origin frame/i.test(msg))) {
      this.setState({ hasError: false, message: "" });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bharat-glow flex items-center justify-center p-6 text-center">
          <div className="card-purple p-6 max-w-sm">
            <h2 className="font-heading text-lg font-bold text-white mb-2">Something went wrong</h2>
            <p className="text-xs text-zinc-400 mb-4">{this.state.message}</p>
            <button onClick={() => window.location.reload()} className="btn-purple rounded-full px-5 py-2 text-sm font-bold">
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
