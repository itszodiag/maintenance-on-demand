import { TrendingDown, TrendingUp } from 'lucide-react';
import clsx from 'clsx';

const toneClasses = {
  blue: 'from-blue-700 via-indigo-600 to-cyan-500 text-white',
  mint: 'from-emerald-500 via-teal-500 to-cyan-600 text-white',
  peach: 'from-amber-400 via-orange-500 to-rose-500 text-white',
  slate: 'from-slate-900 via-slate-800 to-slate-700 text-white',
};

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  delta = null,
  tone = 'blue',
}) {
  const positive = delta === null ? true : delta >= 0;

  return (
    <div
      className={clsx(
        'rounded-[30px] bg-gradient-to-br p-5 shadow-[0_30px_60px_-35px_rgba(37,99,235,0.85)]',
        toneClasses[tone] ?? toneClasses.blue
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-white/70">{label}</p>
          <p className="mt-3 text-3xl font-black tracking-tight">{value}</p>
          {hint && <p className="mt-2 text-sm text-white/75">{hint}</p>}
          {delta !== null && (
            <div
              className={clsx(
                'mt-4 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold',
                positive ? 'bg-white/15 text-white' : 'bg-slate-950/15 text-white'
              )}
            >
              {positive ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5" />
              )}
              {positive ? '+' : ''}
              {delta}%
            </div>
          )}
        </div>
        {Icon && (
          <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-white/15">
            <Icon className="h-7 w-7" />
          </div>
        )}
      </div>
    </div>
  );
}
