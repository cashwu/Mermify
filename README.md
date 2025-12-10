# Mermify

> 透過流動動畫，為您的 Mermaid 圖表注入生命。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/react-19-blue)
![Vite](https://img.shields.io/badge/vite-7-purple)

Mermify 是一個功能強大的網路應用程式，能將靜態的 Mermaid 圖表轉換為動態視覺化內容。透過即時編輯和可自訂的流動效果，它能幫助您建立引人入勝的圖表，清晰地展示流程和數據流。

## ✨ 功能特色

*   **即時編輯器**: 在基於 Monaco 的編輯器中編寫 Mermaid 程式碼，並獲得即時回饋。
*   **動態動畫**:
    *   **虛線流動 (Dash Flow)**: 透過移動的虛線視覺化流程（基於 CSS）。
    *   **粒子流動 (Particle Flow)**: 模擬數據包沿著路徑移動（基於 SMIL）。
*   **高品質匯出**: 將您的動畫圖表匯出為 **APNG** (動畫 PNG) 檔案，方便用於演示或文件。
*   **主題樣式**: 切換內建主題（例如 Dark Cyan），以符合您的美學。
*   **互動控制**: 即時播放/暫停動畫、調整速度和切換動畫類型。

## 🚀 快速開始

### 先決條件

*   Node.js (建議 v18 或更高版本)
*   npm

### 安裝

1.  複製儲存庫:
    ```bash
    git clone https://github.com/cashwu/Mermify.git
    cd Mermify
    ```

2.  安裝依賴項:
    ```bash
    npm install
    ```

### 運行應用程式

啟動開發伺服器:

```bash
npm run dev
```

在您的瀏覽器中打開 [http://localhost:3000](http://localhost:3000)。

### 建構生產版本

建構應用程式以進行部署:

```bash
npm run build
```

您可以在本地預覽生產版本:

```bash
npm run preview
```

## 🛠️ 技術棧

*   **框架**: [React 19](https://react.dev/)
*   **建構工具**: [Vite](https://vitejs.dev/)
*   **樣式**: [Tailwind CSS 4](https://tailwindcss.com/)
*   **路由**: [TanStack Router](https://tanstack.com/router)
*   **圖表**: [Mermaid.js](https://mermaid.js.org/)
*   **狀態管理**: [Zustand](https://docs.pmnd.rs/zustand)
*   **程式碼編輯器**: [Monaco Editor](https://microsoft.github.io/monaco-editor/)
*   **匯出**: [upng-js](https://github.com/photopea/UPNG.js)

## 📄 授權條款

本專案採用 MIT 授權條款 - 詳情請參閱 [LICENSE](LICENSE) 檔案。

---

由 [Cash Wu](https://github.com/cashwu) 建立。
