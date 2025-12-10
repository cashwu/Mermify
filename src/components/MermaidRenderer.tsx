import { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { initMermaid, renderMermaidWithTheme } from '../lib/mermaid-config';
import {
  injectAnimations,
  setAnimationPlayState,
  updateAnimationSpeed,
} from '../lib/animations/inject-animations';
import { useAnimationStore } from '../stores/animation-store';
import { getTheme } from '../lib/themes';

interface MermaidRendererProps {
  code: string;
}

export interface MermaidRendererRef {
  getSvgElement: () => SVGSVGElement | null;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  getScale: () => number;
}

// 初始化 mermaid
let initialized = false;

// 縮放設定
const MIN_SCALE = 0.25;
const MAX_SCALE = 3;
const ZOOM_STEP = 0.1;

export const MermaidRenderer = forwardRef<MermaidRendererRef, MermaidRendererProps>(
  function MermaidRenderer({ code }, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [renderKey, setRenderKey] = useState(0);

  // 縮放和拖曳狀態
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const positionStartRef = useRef({ x: 0, y: 0 });

  const { isPlaying, speed, animationType, theme } = useAnimationStore();
  const themeColors = getTheme(theme);

  // 縮放控制函數
  const zoomIn = useCallback(() => {
    setScale((s) => Math.min(MAX_SCALE, s + ZOOM_STEP));
  }, []);

  const zoomOut = useCallback(() => {
    setScale((s) => Math.max(MIN_SCALE, s - ZOOM_STEP));
  }, []);

  const resetZoom = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  // 暴露方法給父組件
  useImperativeHandle(ref, () => ({
    getSvgElement: () => containerRef.current?.querySelector('svg') || null,
    zoomIn,
    zoomOut,
    resetZoom,
    getScale: () => scale,
  }));

  // 滾輪縮放
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    setScale((s) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, s + delta)));
  }, []);

  // 開始拖曳
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; // 只處理左鍵
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    positionStartRef.current = { ...position };
  }, [position]);

  // 拖曳中
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPosition({
      x: positionStartRef.current.x + dx,
      y: positionStartRef.current.y + dy,
    });
  }, [isDragging]);

  // 結束拖曳
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // 雙擊重置
  const handleDoubleClick = useCallback(() => {
    resetZoom();
  }, [resetZoom]);

  // 渲染 Mermaid 圖表
  const renderChart = useCallback(async () => {
    if (!containerRef.current || !code.trim()) return;

    try {
      if (!initialized) {
        initMermaid();
        initialized = true;
      }

      setError(null);
      const id = `mermaid-${Date.now()}`;
      // 使用主題渲染圖表
      const svg = await renderMermaidWithTheme(code, id, theme);

      if (containerRef.current) {
        containerRef.current.innerHTML = svg;

        // 注入動畫（傳入主題以設定粒子顏色）
        const svgElement = containerRef.current.querySelector('svg');
        if (svgElement) {
          injectAnimations(svgElement, animationType, speed, theme);
          setAnimationPlayState(svgElement, isPlaying);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to render diagram');
    }
  }, [code, animationType, speed, theme]);

  // 當 code 或 animationType 改變時重新渲染
  useEffect(() => {
    renderChart();
  }, [renderChart, renderKey]);

  // 當動畫類型或主題改變時觸發重新渲染
  useEffect(() => {
    setRenderKey((k) => k + 1);
  }, [animationType, theme]);

  // 當播放狀態改變時更新
  useEffect(() => {
    const svgElement = containerRef.current?.querySelector('svg');
    if (svgElement) {
      setAnimationPlayState(svgElement, isPlaying);
    }
  }, [isPlaying]);

  // 當速度改變時更新
  useEffect(() => {
    const svgElement = containerRef.current?.querySelector('svg');
    if (svgElement) {
      updateAnimationSpeed(svgElement, speed);
    }
  }, [speed]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 max-w-md">
          <h3 className="text-red-400 font-semibold mb-2">Render Error</h3>
          <pre className="text-red-300 text-sm whitespace-pre-wrap">{error}</pre>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full h-full overflow-hidden relative transition-colors duration-200"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onDoubleClick={handleDoubleClick}
      style={{
        cursor: isDragging ? 'grabbing' : 'grab',
        backgroundColor: themeColors.background,
      }}
    >
      <div
        ref={containerRef}
        className="w-full h-full flex items-center justify-center"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transformOrigin: 'center center',
          transition: isDragging ? 'none' : 'transform 0.1s ease-out',
        }}
      />
    </div>
  );
})
