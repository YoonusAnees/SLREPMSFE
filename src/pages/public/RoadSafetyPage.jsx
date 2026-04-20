export default function RoadSafetyPage() {
  const tips = [
    {
      title: "Wear helmets and seatbelts",
      text: "Helmets and seatbelts significantly reduce injury risk during crashes and sudden impacts.",
      icon: "⛑️",
    },
    {
      title: "Avoid drunk and reckless driving",
      text: "Driving under the influence or at unsafe speed increases the risk of major road incidents.",
      icon: "🚫",
    },
    {
      title: "Follow traffic signals",
      text: "Stopping at red lights and respecting road signs helps protect drivers, riders, and pedestrians.",
      icon: "🚦",
    },
    {
      title: "Keep your vehicle roadworthy",
      text: "Check brakes, tyres, lights, insurance, and overall condition regularly.",
      icon: "🔧",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white">
          Road Safety Guidelines
        </h1>
        <p className="mt-3 text-slate-400 max-w-3xl leading-7">
          Basic road safety reminders for drivers, riders, passengers, and the
          general public.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {tips.map((tip) => (
          <div
            key={tip.title}
            className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6"
          >
            <div className="text-3xl">{tip.icon}</div>
            <h3 className="mt-4 text-lg font-semibold text-white">
              {tip.title}
            </h3>
            <p className="mt-3 text-sm text-slate-400 leading-6">{tip.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
