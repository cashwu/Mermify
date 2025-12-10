/**
 * 主題配置 - 定義 6 種顏色主題（深色 3 套 + 淺色 3 套）
 */

export type ThemeName =
  | 'dark-cyan'
  | 'dark-purple'
  | 'dark-green'
  | 'light-blue'
  | 'light-purple'
  | 'light-rose';

export interface ThemeColors {
  name: string;           // 顯示名稱
  isDark: boolean;        // 是否為深色主題
  background: string;     // 背景色
  nodeBackground: string; // 節點填充色
  nodeBorder: string;     // 節點邊框色
  lineColor: string;      // 連接線顏色
  textColor: string;      // 文字顏色
  particleColor: string;  // 粒子顏色
  clusterBorder: string;  // 群組邊框色
  edgeLabelBackground: string; // 邊標籤背景色
}

export const THEMES: Record<ThemeName, ThemeColors> = {
  // 深色主題 1: 青藍色（現有配色）
  'dark-cyan': {
    name: 'Dark Cyan',
    isDark: true,
    background: '#0f172a',
    nodeBackground: '#1e293b',
    nodeBorder: '#0ea5e9',
    lineColor: '#0ea5e9',
    textColor: '#f1f5f9',
    particleColor: '#0ea5e9',
    clusterBorder: '#475569',
    edgeLabelBackground: '#1e293b',
  },

  // 深色主題 2: 紫色
  'dark-purple': {
    name: 'Dark Purple',
    isDark: true,
    background: '#1a1625',
    nodeBackground: '#2d2640',
    nodeBorder: '#a855f7',
    lineColor: '#a855f7',
    textColor: '#f3e8ff',
    particleColor: '#a855f7',
    clusterBorder: '#6b21a8',
    edgeLabelBackground: '#2d2640',
  },

  // 深色主題 3: 綠色
  'dark-green': {
    name: 'Dark Green',
    isDark: true,
    background: '#0f1a14',
    nodeBackground: '#1a2e23',
    nodeBorder: '#22c55e',
    lineColor: '#22c55e',
    textColor: '#dcfce7',
    particleColor: '#22c55e',
    clusterBorder: '#166534',
    edgeLabelBackground: '#1a2e23',
  },

  // 淺色主題 1: 藍色
  'light-blue': {
    name: 'Light Blue',
    isDark: false,
    background: '#ffffff',
    nodeBackground: '#f0f9ff',
    nodeBorder: '#3b82f6',
    lineColor: '#3b82f6',
    textColor: '#1e3a5f',
    particleColor: '#3b82f6',
    clusterBorder: '#93c5fd',
    edgeLabelBackground: '#f0f9ff',
  },

  // 淺色主題 2: 紫色
  'light-purple': {
    name: 'Light Purple',
    isDark: false,
    background: '#faf5ff',
    nodeBackground: '#f3e8ff',
    nodeBorder: '#9333ea',
    lineColor: '#9333ea',
    textColor: '#581c87',
    particleColor: '#9333ea',
    clusterBorder: '#d8b4fe',
    edgeLabelBackground: '#f3e8ff',
  },

  // 淺色主題 3: 玫瑰紅
  'light-rose': {
    name: 'Light Rose',
    isDark: false,
    background: '#fff1f2',
    nodeBackground: '#ffe4e6',
    nodeBorder: '#e11d48',
    lineColor: '#e11d48',
    textColor: '#881337',
    particleColor: '#e11d48',
    clusterBorder: '#fda4af',
    edgeLabelBackground: '#ffe4e6',
  },
};

// 主題列表（用於 UI 顯示）
export const THEME_LIST = Object.entries(THEMES).map(([key, value]) => ({
  id: key as ThemeName,
  ...value,
}));

// 取得主題配色
export function getTheme(name: ThemeName): ThemeColors {
  return THEMES[name];
}
