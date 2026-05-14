import { create } from 'zustand';
import { applyTheme, persistTheme, resolveTheme } from '../lib/theme.js';

export const useThemeStore = create((set, get) => ({
  theme: resolveTheme(),
  hydrated: false,
  hydrate: () => {
    const theme = resolveTheme();
    applyTheme(theme);
    set({ theme, hydrated: true });
  },
  setTheme: (theme) => {
    applyTheme(theme);
    persistTheme(theme);
    set({ theme, hydrated: true });
  },
  toggleTheme: () => {
    const currentTheme = get().theme;
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    get().setTheme(nextTheme);
  },
}));
