import { useUIStore } from "../store/ui.store";

export default function LoadingOverlay() {
  const isLoading = useUIStore((s) => s.globalLoading);

  if (!isLoading) return null;

  return (
    <div
      className="
        fixed inset-0 z-[9998]
        bg-gradient-to-br from-slate-950/90 via-indigo-950/80 to-slate-950/90
        backdrop-blur-sm
        flex items-center justify-center
      "
    >
      <div
        className="
          bg-slate-900/80 backdrop-blur-md
          border border-slate-700/60
          rounded-2xl shadow-2xl shadow-black/60
          px-8 py-6 min-w-[240px]
          flex flex-col items-center gap-4
        "
      >
        {/* Spinner */}
        <div className="relative">
          <div
            className="
              h-12 w-12 rounded-full
              border-4 border-indigo-700/30 border-t-indigo-400
              animate-spin
            "
          />
          {/* Optional inner pulse ring */}
          <div
            className="
              absolute inset-0 rounded-full
              border-2 border-indigo-500/20
              animate-ping-slow
            "
          />
        </div>

        {/* Text */}
        <div className="text-center">
          <div className="text-lg font-semibold text-white tracking-tight">
            Processing...
          </div>
          <div className="mt-1 text-sm text-slate-400">
            Please wait a moment
          </div>
        </div>

        {/* Optional subtle progress hint (visual only) */}
        <div className="w-32 h-1 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="
              h-full bg-gradient-to-r from-indigo-500 via-indigo-400 to-indigo-500
              animate-progress
            "
            style={{ width: "40%" }}
          />
        </div>
      </div>

      {/* Global keyframe styles */}
      <style jsx global>{`
        @keyframes progress {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(350%);
          }
        }
        .animate-progress {
          animation: progress 2.5s linear infinite;
        }
        .animate-ping-slow {
          animation: ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        @keyframes ping {
          75%,
          100% {
            transform: scale(1.8);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
