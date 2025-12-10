import { create } from 'zustand';
import type { ThemeName } from '../lib/themes';

export type AnimationType = 'dash' | 'particle' | 'both';

interface AnimationState {
  isPlaying: boolean;
  speed: number;
  animationType: AnimationType;
  theme: ThemeName;
  toggle: () => void;
  setSpeed: (speed: number) => void;
  setType: (type: AnimationType) => void;
  setPlaying: (playing: boolean) => void;
  setTheme: (theme: ThemeName) => void;
}

export const useAnimationStore = create<AnimationState>((set) => ({
  isPlaying: true,
  speed: 1,
  animationType: 'both',
  theme: 'dark-cyan',
  toggle: () => set((s) => ({ isPlaying: !s.isPlaying })),
  setSpeed: (speed) => set({ speed }),
  setType: (animationType) => set({ animationType }),
  setPlaying: (isPlaying) => set({ isPlaying }),
  setTheme: (theme) => set({ theme }),
}));
