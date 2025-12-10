import { createFileRoute } from '@tanstack/react-router';
import { useState, useCallback, useRef, useEffect } from 'react';
import { MermaidRenderer, type MermaidRendererRef } from '../components/MermaidRenderer';
import { CodeEditor } from '../components/CodeEditor';
import { PreviewControls } from '../components/PreviewControls';
import { ZoomControls } from '../components/ZoomControls';
import { DEFAULT_MERMAID_CODE } from '../lib/mermaid-config';

export const Route = createFileRoute('/')({
  component: App,
});

function App() {
  const [code, setCode] = useState(DEFAULT_MERMAID_CODE);
  const [debouncedCode, setDebouncedCode] = useState(DEFAULT_MERMAID_CODE);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 分隔條拖動狀態 - 預設 30% 給 code editor，70% 給 preview
  const [leftPanelWidth, setLeftPanelWidth] = useState(30);
  const isDraggingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const mermaidRef = useRef<MermaidRendererRef>(null);

  // 縮放狀態（用於顯示在 ZoomControls）
  const [displayScale, setDisplayScale] = useState(1);

  // 定期更新顯示的縮放比例
  useEffect(() => {
    const interval = setInterval(() => {
      if (mermaidRef.current) {
        setDisplayScale(mermaidRef.current.getScale());
      }
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // 防抖處理
  const handleCodeChange = useCallback((newCode: string) => {
    setCode(newCode);

    // 清除之前的 timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // 設置新的 timer
    timerRef.current = setTimeout(() => {
      setDebouncedCode(newCode);
    }, 500);
  }, []);

  // 清理 timer
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // 分隔條拖動處理
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

      // 限制範圍在 15% 到 70% 之間
      setLeftPanelWidth(Math.min(70, Math.max(15, newWidth)));
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div className="flex flex-col h-full bg-slate-900">
      {/* Main Content */}
      <div ref={containerRef} className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Panel - Code Editor */}
        <div
          className="flex flex-col min-w-0"
          style={{ width: `${leftPanelWidth}%` }}
        >
          <div className="px-4 py-2 bg-slate-800 border-b border-slate-700">
            <h2 className="text-sm font-medium text-slate-300">Mermaid Code</h2>
          </div>
          <div className="flex-1 overflow-hidden">
            <CodeEditor value={code} onChange={handleCodeChange} />
          </div>
        </div>

        {/* Resizable Divider */}
        <div
          className="w-1 bg-slate-700 hover:bg-sky-500 cursor-col-resize transition-colors flex-shrink-0 relative group"
          onMouseDown={handleMouseDown}
        >
          <div className="absolute inset-y-0 -left-1 -right-1 group-hover:bg-sky-500/20" />
        </div>

        {/* Right Panel - Preview */}
        <div
          className="flex flex-col bg-slate-900 min-w-0"
          style={{ width: `${100 - leftPanelWidth}%` }}
        >
          <div className="px-4 py-2 bg-slate-800 border-b border-slate-700">
            <h2 className="text-sm font-medium text-slate-300">Preview</h2>
          </div>
          <div className="flex-1 overflow-hidden relative">
            <MermaidRenderer ref={mermaidRef} code={debouncedCode} />
            {/* 右上角：動畫控制 + 匯出 */}
            <PreviewControls getSvgElement={() => mermaidRef.current?.getSvgElement() || null} />
            {/* 右下角：縮放控制 */}
            <ZoomControls
              scale={displayScale}
              onZoomIn={() => mermaidRef.current?.zoomIn()}
              onZoomOut={() => mermaidRef.current?.zoomOut()}
              onReset={() => mermaidRef.current?.resetZoom()}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
