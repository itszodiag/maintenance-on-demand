import { MessageCircleMore } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { aiApi } from '../api/modules.js';
import { ChatPopup } from './ChatPopup.jsx';

const welcomeMessage = {
  id: 1,
  sender: 'ai',
  text: 'Hello! I can help with order status, technician tasks, complaints, and general questions.',
};

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([welcomeMessage]);
  const listRef = useRef(null);
  const nextIdRef = useRef(2);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const container = listRef.current;

    if (!container) {
      return;
    }

    container.scrollTop = container.scrollHeight;
  }, [isOpen, loading, messages]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const message = input.trim();

    if (!message || loading) {
      return;
    }

    const userMessage = {
      id: nextIdRef.current++,
      sender: 'user',
      text: message,
    };

    setMessages((current) => [...current, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await aiApi.chat(message);

      setMessages((current) => [
        ...current,
        {
          id: nextIdRef.current++,
          sender: 'ai',
          text: response.response || 'I received your message.',
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: nextIdRef.current++,
          sender: 'ai',
          text: error.message || 'Unable to reach AI support right now.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ChatPopup
        isOpen={isOpen}
        messages={messages}
        input={input}
        loading={loading}
        onClose={() => setIsOpen(false)}
        onInputChange={setInput}
        onSubmit={handleSubmit}
        listRef={listRef}
      />

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="fixed bottom-6 right-6 z-[80] flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-700 to-cyan-500 text-white shadow-[0_20px_45px_-18px_rgba(37,99,235,0.8)] transition hover:scale-105 hover:shadow-[0_24px_55px_-18px_rgba(14,116,144,0.85)] sm:bottom-8 sm:right-8"
        aria-label={isOpen ? 'Close AI chat' : 'Open AI chat'}
      >
        <MessageCircleMore className="h-7 w-7" />
      </button>
    </>
  );
}
