import { Bell, X, CheckCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';

/**
 * NotificationModal - Notification dropdown panel for the navbar bell button.
 *
 * Design decisions:
 * - Uses fixed positioning anchored to the trigger button for clean placement
 * - z-[200] to stay above chatbot (z-75) and profile dropdown (z-100)
 * - 480px width on desktop for comfortable reading, full-width minus margins on mobile
 * - max-height 520px to avoid viewport overflow
 * - Smooth scale/opacity entrance animation
 * - Right-aligned by default, repositioned if it would overflow the viewport
 */
export function NotificationModal({
  isOpen,
  onClose,
  unreadCount,
  items,
  onMarkAllRead,
  triggerRef,
}) {
  const panelRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, right: 0 });

  // Calculate position based on trigger button location
  useEffect(() => {
    if (!isOpen || !triggerRef?.current) return;

    const calculatePosition = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;

      const triggerRect = trigger.getBoundingClientRect();
      const panelWidth = 480;
      const gap = 8;
      const padding = 16;
      const viewportWidth = window.innerWidth;

      // Position below the trigger
      const top = triggerRect.bottom + gap;

      // Right-align to the trigger button's right edge
      let right = viewportWidth - triggerRect.right;

      // Ensure the panel doesn't overflow the left edge
      const leftEdge = viewportWidth - right - panelWidth;
      if (leftEdge < padding) {
        right = viewportWidth - panelWidth - padding;
      }

      // Ensure right doesn't go negative
      if (right < padding) {
        right = padding;
      }

      setPosition({ top, right });
    };

    calculatePosition();
    window.addEventListener('resize', calculatePosition);
    window.addEventListener('scroll', calculatePosition, true);
    return () => {
      window.removeEventListener('resize', calculatePosition);
      window.removeEventListener('scroll', calculatePosition, true);
    };
  }, [isOpen, triggerRef]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target) &&
        triggerRef?.current &&
        !triggerRef.current.contains(event.target)
      ) {
        onClose();
      }
    };

    // Close on Escape key
    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop overlay for mobile */}
      <div
        className="fixed inset-0 z-[190] bg-black/20 backdrop-blur-[2px] md:bg-transparent md:backdrop-blur-none"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Notification Panel */}
      <div
        ref={panelRef}
        style={{
          position: 'fixed',
          top: `${position.top}px`,
          right: `${position.right}px`,
        }}
        className={clsx(
          'z-[200] w-[calc(100vw-32px)] md:w-[480px] max-h-[520px]',
          'rounded-2xl border border-slate-200/80 dark:border-slate-700/60',
          'bg-white dark:bg-slate-900',
          'shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]',
          'overflow-hidden flex flex-col',
          'animate-[notifSlideIn_0.2s_ease-out]'
        )}
      >
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 dark:from-blue-500/20 dark:to-cyan-500/20">
              <Bell className="h-4.5 w-4.5 text-blue-600 dark:text-cyan-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {unreadCount} unread
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {items.length > 0 && unreadCount > 0 && (
              <button
                onClick={onMarkAllRead}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-blue-600 dark:text-cyan-400 transition-colors hover:bg-blue-50 dark:hover:bg-slate-800"
                title="Mark all as read"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Mark all read</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close notifications"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {items.length === 0 ? (
            <div className="flex items-center justify-center min-h-[280px] px-6 py-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800 mb-3">
                  <Bell className="h-6 w-6 text-slate-400 dark:text-slate-500" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
                  All caught up
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No new notifications at the moment
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {items.slice(0, 20).map((n) => (
                <div
                  key={n.id}
                  className={clsx(
                    'px-5 py-3.5 transition-colors duration-150 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer',
                    n.read_at
                      ? 'bg-white dark:bg-slate-900'
                      : 'bg-blue-50/50 dark:bg-blue-950/20'
                  )}
                >
                  <div className="flex gap-3">
                    {/* Unread Indicator */}
                    <div className="pt-1 shrink-0">
                      <div
                        className={clsx(
                          'h-2 w-2 rounded-full',
                          n.read_at
                            ? 'bg-slate-300 dark:bg-slate-600'
                            : 'bg-blue-500 dark:bg-cyan-400 shadow-[0_0_6px_rgba(59,130,246,0.5)]'
                        )}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                        {n.title || n.message || 'New notification'}
                      </p>
                      {n.message && n.title && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                          {n.message}
                        </p>
                      )}
                      <time className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-1.5 block">
                        {new Date(n.created_at).toLocaleString()}
                      </time>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="sticky bottom-0 z-20 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-5 py-3 shrink-0">
            <a
              href="/notifications"
              className="block w-full text-center px-4 py-2 rounded-xl text-xs font-semibold text-blue-600 dark:text-cyan-400 transition-colors hover:bg-blue-50 dark:hover:bg-slate-800"
            >
              View all notifications
            </a>
          </div>
        )}
      </div>

      {/* Animation keyframe injected inline */}
      <style>{`
        @keyframes notifSlideIn {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </>
  );
}
