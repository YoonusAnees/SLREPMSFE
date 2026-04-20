export default function Button({ loading, children, className = "", ...props }) {
  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      className={`px-4 py-2 rounded-xl bg-black text-white disabled:opacity-50 flex items-center justify-center gap-2 ${className}`}
    >
      {loading && (
        <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
      )}
      {children}
    </button>
  );
}