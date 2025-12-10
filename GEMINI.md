# Mermaid Motion

## Project Overview

Mermaid Motion is a web application that brings Mermaid diagrams to life with animations. It allows users to write Mermaid code, visualize the diagram in real-time, and apply configurable animations such as "Dash Flow" (moving dashed lines) and "Particle Flow" (particles moving along paths). Users can export the animated diagrams as APNG files.

**Key Features:**
*   **Live Editor:** Monaco Editor for writing Mermaid code with live preview (debounced).
*   **Animations:**
    *   **Dash Flow:** CSS-based animation using `stroke-dasharray`.
    *   **Particle Flow:** SMIL-based animation using `<animateMotion>`.
*   **Export:** APNG export functionality with custom frame-by-frame rendering logic to ensure high-quality output.
*   **Theming:** Supports multiple themes (e.g., Dark Cyan) that control colors for nodes, edges, and particles.

## Architecture & Technologies

*   **Frontend Framework:** React 19 + TypeScript
*   **Build Tool:** Vite
*   **Styling:** Tailwind CSS 4
*   **State Management:** Zustand (`src/stores/`)
*   **Routing:** TanStack Router (File-based routing in `src/routes/`)
*   **Diagram Rendering:** Mermaid.js
*   **Code Editor:** @monaco-editor/react
*   **Image Encoding:** upng-js (for APNG export)
*   **Testing:** Vitest

## Directory Structure

*   `src/routes/`: Contains the application routes (TanStack Router).
    *   `__root.tsx`: The root layout component.
    *   `index.tsx`: The main application view (Editor + Preview).
*   `src/components/`: React components.
    *   `MermaidRenderer.tsx`: Handles the rendering of Mermaid diagrams and integration with animation logic.
    *   `CodeEditor.tsx`: Wrapper around Monaco Editor.
*   `src/lib/`: Core logic and utilities.
    *   `animations/inject-animations.ts`: Logic for injecting CSS and SMIL animations into the SVG.
    *   `export-apng.ts`: Handles the complex process of frame-by-frame SVG capturing, styling inlining, and APNG encoding.
    *   `mermaid-config.ts`: Default configuration and examples.
    *   `themes.ts`: Theme definitions.
*   `src/stores/`: Zustand stores (e.g., `animation-store.ts`).

## Building and Running

### Prerequisites
*   Node.js (Ensure compatibility with the project's dependencies)
*   npm

### Commands

*   **Development Server:**
    ```bash
    npm run dev
    ```
    Starts the Vite development server on port 3000.

*   **Build for Production:**
    ```bash
    npm run build
    ```
    Builds the application using Vite and runs TypeScript type checking.

*   **Preview Production Build:**
    ```bash
    npm run preview
    ```

*   **Run Tests:**
    ```bash
    npm run test
    ```
    Executes tests using Vitest.

## Development Conventions

*   **Routing:** New routes should be added as files in `src/routes/`. TanStack Router automatically generates the route tree.
*   **Animation Logic:** Keep animation injection logic separate from React components in `src/lib/animations/`. This facilitates reuse and testing.
*   **Exporting:** The export process involves cloning the SVG, manually updating animation states for each frame, and converting to canvas/blob. Ensure `foreignObject` elements are converted to SVG text for compatibility.
*   **Styling:** Use Tailwind CSS for UI components. For SVG internals, use inline styles or specific classes handled by the injection logic to ensure they persist during export.

# Mermaid Motion

## 專案概覽 (Project Overview)

Mermaid Motion 是一個網頁應用程式，透過動畫為 Mermaid 圖表注入生命。它允許使用者編寫 Mermaid 程式碼，即時視覺化圖表，並應用可配置的動畫，例如「虛線流動」(Dash Flow) 和「粒子流動」(Particle Flow)（粒子沿路徑移動）。使用者可以將動畫圖表匯出為 APNG 檔案。

**主要功能 (Key Features):**
*   **即時編輯器 (Live Editor):** 使用 Monaco Editor 編寫 Mermaid 程式碼，具有即時預覽功能（防抖動處理）。
*   **動畫效果 (Animations):**
    *   **虛線流動 (Dash Flow):** 使用 `stroke-dasharray` 的 CSS 動畫。
    *   **粒子流動 (Particle Flow):** 使用 `<animateMotion>` 沿路徑移動粒子的 SMIL 動畫。
*   **匯出 (Export):** 具有自訂逐幀渲染邏輯的 APNG 匯出功能，以確保高品質輸出。
*   **主題樣式 (Theming):** 支援多種主題（例如 Dark Cyan），控制節點、邊緣和粒子的顏色。

## 架構與技術 (Architecture & Technologies)

*   **前端框架 (Frontend Framework):** React 19 + TypeScript
*   **建構工具 (Build Tool):** Vite
*   **樣式 (Styling):** Tailwind CSS 4
*   **狀態管理 (State Management):** Zustand (`src/stores/`)
*   **路由 (Routing):** TanStack Router (基於檔案的路由，位於 `src/routes/`)
*   **圖表渲染 (Diagram Rendering):** Mermaid.js
*   **程式碼編輯器 (Code Editor):** @monaco-editor/react
*   **圖片編碼 (Image Encoding):** upng-js (用於 APNG 匯出)
*   **測試 (Testing):** Vitest

## 目錄結構 (Directory Structure)

*   `src/routes/`: 包含應用程式路由 (TanStack Router)。
    *   `__root.tsx`: 根佈局組件。
    *   `index.tsx`: 主要應用程式視圖（編輯器 + 預覽）。
*   `src/components/`: React 組件。
    *   `MermaidRenderer.tsx`: 處理 Mermaid 圖表的渲染以及與動畫邏輯的整合。
    *   `CodeEditor.tsx`: Monaco Editor 的封裝。
*   `src/lib/`: 核心邏輯和實用程式。
    *   `animations/inject-animations.ts`: 將 CSS 和 SMIL 動畫注入 SVG 的邏輯。
    *   `export-apng.ts`: 處理逐幀 SVG 捕捉、樣式內聯和 APNG 編碼的複雜過程。
    *   `mermaid-config.ts`: 預設配置和範例。
    *   `themes.ts`: 主題定義。
*   `src/stores/`: Zustand 狀態儲存 (例如 `animation-store.ts`)。

## 建置與運行 (Building and Running)

### 先決條件 (Prerequisites)
*   Node.js (確保與專案的依賴項相容)
*   npm

### 命令 (Commands)

*   **開發伺服器 (Development Server):**
    ```bash
    npm run dev
    ```
    在埠 3000 啟動 Vite 開發伺服器。

*   **建構生產版本 (Build for Production):**
    ```bash
    npm run build
    ```
    使用 Vite 建構應用程式並執行 TypeScript 類型檢查。

*   **預覽生產版本 (Preview Production Build):**
    ```bash
    npm run preview
    ```

*   **運行測試 (Run Tests):**
    ```bash
    npm run test
    ```
    使用 Vitest 執行測試。

## 開發慣例 (Development Conventions)

*   **路由 (Routing):** 新路由應作為檔案添加到 `src/routes/` 中。TanStack Router 會自動生成路由樹。
*   **動畫邏輯 (Animation Logic):廣Keep animation injection logic separate from React components in `src/lib/animations/`. This facilitates reuse and testing.
*   **匯出 (Exporting):** 匯出過程涉及複製 SVG、手動更新每一幀的動畫狀態，並轉換為 canvas/blob。確保 `foreignObject` 元素轉換為 SVG 文本以實現兼容性。
*   **樣式 (Styling):** 使用 Tailwind CSS 進行 UI 組件樣式設定。對於 SVG 內部，使用內聯樣式或由注入邏輯處理的特定類別，以確保它們在匯出時保留。
