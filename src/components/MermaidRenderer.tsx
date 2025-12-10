import { useEffect, useRef, useState, useCallback } from 'react';
import { initMermaid, renderMermaid } from '../lib/mermaid-config';
import {
  injectAnimations,
  setAnimationPlayState,
  updateAnimationSpeed,
} from '../lib/animations/inject-animations';
import { useAnimationStore } from '../stores/animation-store';

interface MermaidRendererProps {
  code: string;
}

// 初始化 mermaid
let initialized = false;

export function MermaidRenderer({ code }: MermaidRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [renderKey, setRenderKey] = useState(0);

  const { isPlaying, speed, animationType } = useAnimationStore();

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
      const svg = await renderMermaid(code, id);

      if (containerRef.current) {
        containerRef.current.innerHTML = svg;

        // 注入動畫
        const svgElement = containerRef.current.querySelector('svg');
        if (svgElement) {
          injectAnimations(svgElement, animationType, speed);
          setAnimationPlayState(svgElement, isPlaying);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to render diagram');
    }
  }, [code, animationType, speed]);

  // 當 code 或 animationType 改變時重新渲染
  useEffect(() => {
    renderChart();
  }, [renderChart, renderKey]);

  // 當動畫類型改變時觸發重新渲染
  useEffect(() => {
    setRenderKey((k) => k + 1);
  }, [animationType]);

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
      ref={containerRef}
      className="w-full h-full flex items-center justify-center overflow-auto p-4"
    />
  );
}
