import { useUIStore } from "../store/ui.store";

export default function ToastHost() {
  const toasts = useUIStore((s) => s.toasts);
  const dismiss = useUIStore((s) => s.dismissToast);

  const getToastStyle = (type) => {
    const base =
      "border rounded-xl shadow-lg px-4 py-3.5 text-sm font-medium backdrop-blur-sm transition-all duration-200";

    switch (type) {
      case "success":
        return `${base} bg-green-900/40 border-green-700/60 text-green-200 shadow-green-900/30`;
      case "error":
        return `${base} bg-red-900/50 border-red-700/60 text-red-200 shadow-red-900/40 animate-pulse-slow`;
      case "warning":
      case "info":
        return `${base} bg-amber-900/40 border-amber-700/60 text-amber-200 shadow-amber-900/30`;
      default:
        return `${base} bg-slate-800/70 border-slate-600/70 text-slate-200 shadow-black/40`;
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "success":
        return "✓";
      case "error":
        return "⚠";
      case "warning":
        return "!";
      case "info":
        return "ℹ";
      default:
        return "→";
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[9999] w-full max-w-sm space-y-3 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            pointer-events-auto flex items-start gap-3.5
            ${getToastStyle(toast.type)}
            animate-in slide-in-from-right-5 fade-in duration-300
          `}
        >
          {/* Icon */}
          <div
            className={`
              flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold
              ${
                toast.type === "success"
                  ? "bg-green-800/60 text-green-200"
                  : toast.type === "error"
                    ? "bg-red-800/60 text-red-200"
                    : toast.type === "warning"
                      ? "bg-amber-800/60 text-amber-200"
                      : "bg-slate-700/60 text-slate-300"
              }
            `}
          >
            {getIcon(toast.type)}
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="text-sm leading-tight">{toast.message}</div>
            {toast.duration !== Infinity && (
              <div className="mt-1.5 h-1 bg-black/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-current opacity-60 transition-all duration-[var(--duration)] ease-linear"
                  style={{
                    width: "100%",
                    animation: `shrink var(--duration) linear forwards`,
                  }}
                />
              </div>
            )}
          </div>

          {/* Dismiss button */}
          <button
            onClick={() => dismiss(toast.id)}
            className="
              flex-shrink-0 text-lg opacity-70 hover:opacity-100
              transition-opacity p-1 -mr-1 -mt-1
            "
            aria-label="Dismiss toast"
          >
            ×
          </button>
        </div>
      ))}

      {/* Optional auto-dismiss progress bar animation */}
      <style jsx global>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
        .animate-pulse-slow {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}
