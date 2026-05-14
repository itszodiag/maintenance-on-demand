export function ChartCard({
  title,
  description,
  action,
  children,
  height = 'h-80',
}) {
  return (
    <section className="rounded-[30px] border border-white/70 dark:border-slate-800/70 bg-white/90 dark:bg-slate-950/90 p-6 shadow-[0_35px_80px_-45px_rgba(37,99,235,0.55)] dark:shadow-none">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h3>
          {description && (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
          )}
        </div>
        {action}
      </div>
      <div className={height}>{children}</div>
    </section>
  );
}
