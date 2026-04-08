import { create } from "zustand";

type AppState = {
  reduceMotion: boolean;
  activeRole: string;
  toggleReduceMotion: () => void;
  setActiveRole: (role: string) => void;
};

export const useAppStore = create<AppState>((set) => ({
  reduceMotion: false,
  activeRole: "Frontend Engineer",
  toggleReduceMotion: () => set((state) => ({ reduceMotion: !state.reduceMotion })),
  setActiveRole: (activeRole) => set({ activeRole }),
}));
