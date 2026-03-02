export default function Card({ title, subtitle, children }) {
  return (
    <div className="bg-white border rounded-2xl p-4">
      {title && <div className="font-semibold">{title}</div>}
      {subtitle && <div className="text-sm text-gray-600 mt-1">{subtitle}</div>}
      <div className="mt-3">{children}</div>
    </div>
  );
}
