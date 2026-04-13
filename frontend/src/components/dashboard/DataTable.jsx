export function DataTable({
  title,
  columns,
  data = [],
  emptyLabel = 'No data available.',
  action = null,
}) {
  return (
    <section className="rounded-[30px] border border-white/70 bg-white/90 shadow-[0_35px_80px_-45px_rgba(15,23,42,0.35)]">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-6 py-5">
        <div>
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        </div>
        {action}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px]">
          <thead>
            <tr className="bg-slate-50/80">
              {columns.map((column) => (
                <th
                  key={column}
                  className="px-6 py-3 text-left text-xs font-bold uppercase tracking-[0.18em] text-slate-400"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-10 text-center text-sm text-slate-500"
                >
                  {emptyLabel}
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr
                  key={row.id ?? index}
                  className="border-t border-slate-100 transition hover:bg-slate-50/60"
                >
                  {columns.map((column) => (
                    <td
                      key={column}
                      className="px-6 py-4 text-sm text-slate-700"
                    >
                      {row[column] ?? '-'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
