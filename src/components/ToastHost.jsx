import { useUIStore } from "../store/ui.store";

export default function ToastHost() {
  const toasts = useUIStore((s) => s.toasts);
  const dismiss = useUIStore((s) => s.dismissToast);

  const tone = (type) => {
    if (type === "success")
      return "border-green-300 bg-green-50 text-green-900";
    if (type === "error") return "border-red-300 bg-red-50 text-red-900";
    if (type === "warning")
      return "border-yellow-300 bg-yellow-50 text-yellow-900";
    return "border-gray-300 bg-white text-gray-900";
  };

  return (
    <div className="fixed top-4 right-4 z-[9999] w-[320px] space-y-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`border rounded-xl shadow-sm px-3 py-2 ${tone(t.type)}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="text-sm">{t.message}</div>
            <button
              className="text-xs opacity-70 hover:opacity-100"
              onClick={() => dismiss(t.id)}
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
