export default function Table({
  columns,
  rows,
  className = "",
  emptyMessage = "No records found",
  loading = false,
  theme = "default", // can be "incident" for more red/urgent styling
}) {
  const hasData = Array.isArray(rows) && rows.length > 0;

  // Slightly different styling when used for incidents
  const isIncidentTheme = theme === "incident";

  return (
    <div
      className={`
        bg-slate-900/75 backdrop-blur-md
        border ${isIncidentTheme ? "border-red-800/50" : "border-slate-700/60"}
        rounded-xl shadow-2xl shadow-black/50
        overflow-hidden
        ${className}
      `}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          {/* Header */}
          <thead
            className={`
              ${
                isIncidentTheme
                  ? "bg-gr-hient-to-r from-red-950/70 via-slate-950/70 to-red-950/70"
                  : "bg-slate-950/70"
              }
              border-b border-slate-700/70
            `}
          >
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`
                    px-6 py-4 text-xs font-semibold uppercase tracking-wider
                    ${isIncidentTheme ? "text-red-300" : "text-slate-300"}
                  `}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-slate-800/60">
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-20 text-center text-slate-500"
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                      <div className="h-12 w-12 rounded-full border-4 border-slate-700/40 border-t-red-500 animate-spin" />
                      <div className="absolute inset-0 rounded-full border-2 border-red-500/20 animate-ping-slow" />
                    </div>
                    <div className="text-lg font-medium text-slate-300">
                      Loading records...
                    </div>
                  </div>
                </td>
              </tr>
            ) : hasData ? (
              rows.map((row, idx) => (
                <tr
                  key={row.id || idx}
                  className={`
                    transition-colors duration-150
                    hover:bg-slate-800/50
                    ${idx % 2 === 0 ? "bg-slate-950/15" : ""}
                    ${isIncidentTheme && row.severity === "CRITICAL" ? "bg-red-950/20 hover:bg-red-950/30" : ""}
                  `}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`
                        px-6 py-4 align-middle
                        ${
                          isIncidentTheme &&
                          col.key === "severity" &&
                          row.severity === "CRITICAL"
                            ? "text-red-400 font-bold"
                            : "text-slate-200"
                        }
                      `}
                    >
                      {col.render ? col.render(row) : (row[col.key] ?? "—")}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-20 text-center text-slate-500"
                >
                  <div className="flex flex-col items-center gap-4 opacity-80">
                    {isIncidentTheme ? (
                      <div className="text-6xl">🚨</div>
                    ) : (
                      <div className="text-6xl">📋</div>
                    )}
                    <div className="text-xl font-medium text-slate-300">
                      {emptyMessage}
                    </div>
                    <div className="text-sm max-w-md">
                      {rows === null || rows === undefined
                        ? "Data is being loaded..."
                        : "No matching records found. Try adjusting filters or search terms."}
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer count (when there is data) */}
      {hasData && !loading && (
        <div
          className={`
            px-6 py-3 border-t text-xs text-right
            ${
              isIncidentTheme
                ? "border-red-900/40 bg-red-950/20 text-red-200/80"
                : "border-slate-700/50 bg-slate-950/30 text-slate-400"
            }
          `}
        >
          Showing <span className="font-medium text-white">{rows.length}</span>{" "}
          record
          {rows.length !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}
