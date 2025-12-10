import { create } from 'zustand';
import type { ThemeName } from '../lib/themes';

export type AnimationType = 'dash' | 'particle' | 'both';
export type LookType = 'classic' | 'handDrawn';

interface AnimationState {
  isPlaying: boolean;
  speed: number;
  animationType: AnimationType;
  theme: ThemeName;
  look: LookType;
  toggle: () => void;
  setSpeed: (speed: number) => void;
  setType: (type: AnimationType) => void;
  setPlaying: (playing: boolean) => void;
  setTheme: (theme: ThemeName) => void;
  setLook: (look: LookType) => void;
}

export const useAnimationStore = create<AnimationState>((set) => ({
  isPlaying: true,
  speed: 1,
  animationType: 'both',
  theme: 'dark-cyan',
  look: 'classic',
  toggle: () => set((s) => ({ isPlaying: !s.isPlaying })),
  setSpeed: (speed) => set({ speed }),
  setType: (animationType) => set({ animationType }),
  setPlaying: (isPlaying) => set({ isPlaying }),
  setTheme: (theme) => set({ theme }),
  setLook: (look) => set({ look }),
}));
