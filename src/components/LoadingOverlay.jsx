import { useUIStore } from "../store/ui.store";

export default function LoadingOverlay() {
  const on = useUIStore((s) => s.globalLoading);
  if (!on) return null;

  return (
    <div className="fixed inset-0 z-[9998] bg-black/30 grid place-items-center">
      <div className="bg-white rounded-2xl px-5 py-4 shadow-md border">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 rounded-full border-2 border-gray-300 border-t-gray-900 animate-spin" />
          <div className="text-sm font-medium">Please wait…</div>
        </div>
      </div>
    </div>
  );
}
