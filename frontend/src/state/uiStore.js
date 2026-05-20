import { create } from 'zustand';

export const useUIStore = create((set) => ({
  notificationsOpen: false,
  setNotificationsOpen: (isOpen) => set({ notificationsOpen: isOpen }),
}));
