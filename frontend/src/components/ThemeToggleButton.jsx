import clsx from 'clsx';
import { MoonStar, SunMedium } from 'lucide-react';
import { useThemeStore } from '../state/themeStore.js';

export function ThemeToggleButton({
  className = '',
  labelClassName = 'hidden lg:inline',
  onToggle,
}) {
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const isDark = theme === 'dark';
  const Icon = isDark ? SunMedium : MoonStar;
  const nextLabel = isDark ? 'Light mode' : 'Dark mode';
  const handleClick = () => {
    toggleTheme();
    onToggle?.();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      aria-pressed={isDark}
      className={clsx(
        'inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-900 dark:border-slate-700 dark:bg-slate-900/85 dark:text-slate-100 dark:hover:bg-slate-800',
        className
      )}
    >
      <Icon className="h-4 w-4" />
      <span className={labelClassName}>{nextLabel}</span>
    </button>
  );
}
