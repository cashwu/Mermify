# Mermify

> Bring your Mermaid diagrams to life with flow animations.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/react-19-blue)
![Vite](https://img.shields.io/badge/vite-7-purple)

Mermify is a powerful web application that transforms static Mermaid diagrams into animated visualizations. With real-time editing and customizable flow effects, it helps you create engaging diagrams that clearly demonstrate processes and data flows.

## ✨ Features

*   **Live Editor**: Write Mermaid code in a Monaco-based editor with instant feedback.
*   **Dynamic Animations**:
    *   **Dash Flow**: Visualizes flow with moving dashed lines (CSS-based).
    *   **Particle Flow**: Simulates data packets moving along paths (SMIL-based).
*   **High-Quality Export**: Export your animated diagrams as **APNG** (Animated PNG) files, ready for presentations or documentation.
*   **Theming**: Switch between built-in themes (e.g., Dark Cyan) to match your aesthetic.
*   **Interactive Controls**: Play/pause animations, adjust speed, and toggle animation types on the fly.

## 🚀 Getting Started

### Prerequisites

*   Node.js (v18 or later recommended)
*   npm

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/cashwu/Mermify.git
    cd Mermify
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

### Running the App

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

To build the application for deployment:

```bash
npm run build
```

You can preview the production build locally with:

```bash
npm run preview
```

## 🛠️ Tech Stack

*   **Framework**: [React 19](https://react.dev/)
*   **Build Tool**: [Vite](https://vitejs.dev/)
*   **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
*   **Routing**: [TanStack Router](https://tanstack.com/router)
*   **Diagrams**: [Mermaid.js](https://mermaid.js.org/)
*   **State Management**: [Zustand](https://docs.pmnd.rs/zustand)
*   **Code Editor**: [Monaco Editor](https://microsoft.github.io/monaco-editor/)
*   **Export**: [upng-js](https://github.com/photopea/UPNG.js)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Created by [Cash Wu](https://github.com/cashwu).