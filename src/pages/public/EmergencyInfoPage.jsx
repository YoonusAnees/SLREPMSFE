export default function EmergencyInfoPage() {
  const items = [
    {
      label: "Police Emergency",
      value: "119",
      tone: "indigo",
    },
    {
      label: "Ambulance Service",
      value: "1990",
      tone: "red",
    },
    {
      label: "Fire & Rescue",
      value: "110",
      tone: "orange",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white">
          Emergency Information
        </h1>
        <p className="mt-3 text-slate-400 max-w-3xl leading-7">
          Important emergency service references for urgent road situations.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {items.map((item) => (
          <div
            key={item.label}
            className={`rounded-2xl border p-6 ${
              item.tone === "indigo"
                ? "border-indigo-700/40 bg-indigo-950/20"
                : item.tone === "red"
                  ? "border-red-700/40 bg-red-950/20"
                  : "border-orange-700/40 bg-orange-950/20"
            }`}
          >
            <div className="text-sm text-slate-400">{item.label}</div>
            <div className="mt-3 text-3xl font-bold text-white">
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
