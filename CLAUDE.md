# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 指令

```bash
npm run dev      # 啟動開發伺服器 (port 3000)
npm run build    # 建置生產版本 (vite build && tsc)
npm run test     # 執行測試 (Vitest)
npm run preview  # 預覽生產版本
```

## 架構

Mermaid Motion 是一個將 Mermaid 圖表加上動畫效果的網頁應用，支援虛線流動和粒子沿路徑移動的 SVG 動畫。

### 核心流程

1. 使用者在左側 Monaco 編輯器輸入 Mermaid 程式碼
2. 程式碼經過 500ms 防抖後傳給 `MermaidRenderer`
3. Mermaid.js 渲染 SVG，然後 `inject-animations.ts` 注入動畫效果
4. 動畫狀態（播放/暫停、速度、類型）由 Zustand store 管理
5. 匯出 APNG 時透過手動更新動畫進度來擷取每一幀

### 主要目錄

- `src/routes/` - TanStack Router 檔案式路由。`__root.tsx` 是佈局，`index.tsx` 是主應用
- `src/lib/animations/` - SVG 動畫注入邏輯（CSS 虛線動畫 + SMIL 粒子動畫）
- `src/lib/export-apng.ts` - 使用 upng-js 匯出 APNG（將 SVG 幀轉為動畫 PNG）
- `src/stores/` - Zustand 全域狀態管理
- `src/types/` - 自定義型別定義（如 upng-js）

### 動畫系統

兩種動畫類型注入到 Mermaid SVG：
- **Dash（虛線）**：在連接線上使用 CSS `stroke-dasharray` 動畫（class: `.dash-flow`）
- **Particle（粒子）**：使用 SMIL `<animateMotion>` 讓圓點沿路徑移動（class: `.flow-particle`）

`inject-animations.ts` 中的 `getEdgePaths()` 使用多個選擇器來支援不同 Mermaid 版本（10.x 和 11.x 的 SVG 結構不同）。

### 狀態管理

`useAnimationStore`（Zustand）包含：`isPlaying`、`speed`、`animationType`（'dash' | 'particle' | 'both'）

### APNG 匯出

匯出功能位於 `src/lib/export-apng.ts`，主要流程：

1. 從原始 SVG 提取路徑資訊（用於計算粒子位置）
2. 為每一幀克隆 SVG 並準備匯出（添加背景、轉換 foreignObject 為 SVG text、內嵌樣式）
3. 手動更新每幀的動畫狀態（虛線 offset、粒子位置）
4. 將 SVG 轉為 canvas ImageData，使用 data URL 避免跨域問題
5. 使用 upng-js 編碼所有幀為 APNG

注意事項：
- Mermaid 使用 `foreignObject` 渲染文字標籤，匯出時需轉換為 SVG `<text>` 元素
- 必須內嵌所有樣式（fill、stroke 等）到 SVG 元素屬性，否則匯出後樣式會遺失
- 使用 data URL 而非 blob URL 來避免 canvas tainted 跨域錯誤

## 技術堆疊

- React 19 + TypeScript
- TanStack Router（檔案式路由）
- Tailwind CSS 4
- Monaco Editor
- Mermaid.js 11
- Zustand 狀態管理
- Vitest 測試框架
