import { create } from 'zustand';

export type AnimationType = 'dash' | 'particle' | 'both';

interface AnimationState {
  isPlaying: boolean;
  speed: number;
  animationType: AnimationType;
  toggle: () => void;
  setSpeed: (speed: number) => void;
  setType: (type: AnimationType) => void;
  setPlaying: (playing: boolean) => void;
}

export const useAnimationStore = create<AnimationState>((set) => ({
  isPlaying: true,
  speed: 1,
  animationType: 'both',
  toggle: () => set((s) => ({ isPlaying: !s.isPlaying })),
  setSpeed: (speed) => set({ speed }),
  setType: (animationType) => set({ animationType }),
  setPlaying: (isPlaying) => set({ isPlaying }),
}));
