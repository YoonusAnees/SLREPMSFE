export default function Input({ label, ...props }) {
  return (
    <div>
      {label && <label className="text-xs text-gray-600">{label}</label>}
      <input
        {...props}
        className={`w-full border rounded-xl px-3 py-2 mt-1 outline-none focus:ring-2 focus:ring-black/10 ${props.className || ""}`}
      />
    </div>
  );
}
