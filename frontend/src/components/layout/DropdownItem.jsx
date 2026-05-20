import { Link } from 'react-router-dom';
import clsx from 'clsx';

export default function DropdownItem({
  to,
  onClick,
  icon: Icon,
  label,
  badge,
  asButton = false,
  className,
}) {
  const baseClasses = clsx(
    'flex items-center justify-between gap-3 rounded-[12px] px-3 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 transition-all duration-150',
    'hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-slate-800 dark:hover:text-cyan-400',
    className
  );

  const iconClasses = clsx(
    'flex h-9 w-9 items-center justify-center rounded-[10px]',
    'bg-blue-50/60 text-blue-600 dark:bg-slate-800 dark:text-cyan-400',
    'transition-all duration-150 group-hover:bg-blue-100 dark:group-hover:bg-cyan-900/30'
  );

  const content = (
    <>
      <span className="flex items-center gap-3">
        <span className={iconClasses}>
          <Icon className="h-4 w-4" />
        </span>
        <span>{label}</span>
      </span>
      {badge && (
        <span className="inline-flex items-center justify-center h-5 min-w-5 rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </>
  );

  if (asButton) {
    return (
      <button type="button" onClick={onClick} className={baseClasses + ' group w-full'}>
        {content}
      </button>
    );
  }

  return (
    <Link to={to} onClick={onClick} className={baseClasses + ' group'}>
      {content}
    </Link>
  );
}
