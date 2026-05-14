import { create } from 'zustand';

export const useLayoutStore = create((set) => ({
  title: '',
  subtitle: '',
  breadcrumbs: [],
  setHeader: (title, subtitle = '') => set({ title, subtitle }),
  setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),
  reset: () => set({ title: '', subtitle: '', breadcrumbs: [] }),
}));
