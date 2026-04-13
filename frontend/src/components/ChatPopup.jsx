import { Loader2, Send, Sparkles, X } from 'lucide-react';

export function ChatPopup({
  isOpen,
  messages,
  input,
  loading,
  onClose,
  onInputChange,
  onSubmit,
  listRef,
}) {
  return (
    <div
      className={`pointer-events-none fixed bottom-24 right-6 z-[70] w-[calc(100vw-2rem)] max-w-[380px] transition-all duration-300 sm:right-8 ${
        isOpen ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
      }`}
    >
      <div className="pointer-events-auto overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-[0_28px_80px_-30px_rgba(15,23,42,0.35)]">
        <div className="flex items-center justify-between bg-gradient-to-r from-blue-700 via-sky-600 to-cyan-500 px-5 py-4 text-white">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold text-white/85">
              <Sparkles className="h-4 w-4" />
              AI Support
            </p>
            <h3 className="mt-1 text-lg font-bold">How can I help today?</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 transition hover:bg-white/25"
            aria-label="Close chat"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div
          ref={listRef}
          className="flex h-[420px] flex-col gap-3 overflow-y-auto bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] px-4 py-4"
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-[22px] px-4 py-3 text-sm leading-6 shadow-sm ${
                  message.sender === 'user'
                    ? 'rounded-br-md bg-blue-700 text-white'
                    : 'rounded-bl-md border border-blue-100 bg-white text-slate-700'
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-[22px] rounded-bl-md border border-blue-100 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                Thinking...
              </div>
            </div>
          )}
        </div>

        <form onSubmit={onSubmit} className="border-t border-slate-100 bg-white p-4">
          <div className="flex items-end gap-3 rounded-[24px] border border-blue-100 bg-slate-50 p-2 shadow-inner shadow-slate-100/70">
            <input
              value={input}
              onChange={(event) => onInputChange(event.target.value)}
              placeholder="Ask about your order, tasks, or complaints..."
              className="min-h-[44px] flex-1 bg-transparent px-3 text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-700 text-white shadow-lg shadow-blue-200 transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
