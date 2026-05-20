import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../../state/themeStore.js';
import clsx from 'clsx';

export default function ToggleSwitch({ label } = {}) {
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="group flex w-full items-center justify-between gap-3 rounded-[12px] px-3 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 transition-all duration-150 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-700 dark:hover:text-cyan-400"
    >
      <span className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-blue-50/60 text-blue-600 dark:bg-slate-800 dark:text-cyan-400 transition-all duration-150 group-hover:bg-blue-100 dark:group-hover:bg-cyan-900/30">
          {theme === 'dark' ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
        </span>
        <span>{label || 'Dark Mode'}</span>
      </span>

      {/* Toggle Switch */}
      <span
        className={clsx(
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200',
          theme === 'dark' ? 'bg-slate-700' : 'bg-slate-300'
        )}
      >
        <span
          className={clsx(
            'inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-200',
            theme === 'dark' ? 'translate-x-5' : 'translate-x-0.5'
          )}
        />
      </span>
    </button>
  );
}
