import { Download, Play, Pause, Loader2, Circle, Layers } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAnimationStore } from '../stores/animation-store';
import { exportToAPNG, downloadBlob } from '../lib/export-apng';

interface PreviewControlsProps {
  getSvgElement: () => SVGSVGElement | null;
}

const SPEED_OPTIONS = [0.5, 1, 1.5, 2, 3];

export function PreviewControls({ getSvgElement }: PreviewControlsProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const speedMenuRef = useRef<HTMLDivElement>(null);
  const { isPlaying, speed, animationType, toggle, setSpeed, setType } = useAnimationStore();

  // 點擊外部關閉速度選單
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (speedMenuRef.current && !speedMenuRef.current.contains(e.target as Node)) {
        setShowSpeedMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = async () => {
    const svgElement = getSvgElement();
    if (!svgElement) {
      alert('No diagram to export');
      return;
    }

    setIsExporting(true);

    try {
      const blob = await exportToAPNG(svgElement, {
        fps: 30,
        duration: 2 / speed,
        scale: 2,
      });

      const filename = `mermaid-animation-${Date.now()}.png`;
      downloadBlob(blob, filename);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export animation. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="absolute top-4 right-4 flex flex-col gap-1 z-10">
      {/* Export 按鈕 */}
      <button
        onClick={handleExport}
        disabled={isExporting}
        className="w-10 h-10 flex items-center justify-center bg-sky-600 hover:bg-sky-500 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg transition-colors"
        title="匯出 APNG 動畫圖片"
      >
        {isExporting ? (
          <Loader2 className="w-5 h-5 text-white animate-spin" />
        ) : (
          <Download className="w-5 h-5 text-white" />
        )}
      </button>

      {/* 分隔線 */}
      <div className="h-px bg-slate-600 my-1" />

      {/* 播放/暫停按鈕 */}
      <button
        onClick={toggle}
        className="w-10 h-10 flex items-center justify-center bg-slate-800/90 hover:bg-slate-700 rounded-lg transition-colors border border-slate-600"
        title={isPlaying ? '暫停動畫' : '播放動畫'}
      >
        {isPlaying ? (
          <Pause className="w-5 h-5 text-slate-300" />
        ) : (
          <Play className="w-5 h-5 text-slate-300" />
        )}
      </button>

      {/* 速度選擇 - 改用點擊展開選單 */}
      <div className="relative" ref={speedMenuRef}>
        <button
          onClick={() => setShowSpeedMenu(!showSpeedMenu)}
          className="w-10 h-10 flex items-center justify-center bg-slate-800/90 hover:bg-slate-700 rounded-lg transition-colors border border-slate-600 text-slate-300 text-xs font-bold"
          title={`動畫速度: ${speed}x (點擊切換)`}
        >
          {speed}x
        </button>

        {/* 速度選單 */}
        {showSpeedMenu && (
          <div className="absolute right-12 top-0 bg-slate-800 border border-slate-600 rounded-lg shadow-lg overflow-hidden">
            {SPEED_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setSpeed(s);
                  setShowSpeedMenu(false);
                }}
                className={`w-14 h-9 flex items-center justify-center text-xs font-medium transition-colors ${
                  speed === s
                    ? 'bg-sky-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 分隔線 */}
      <div className="h-px bg-slate-600 my-1" />

      {/* 動畫樣式按鈕 - 使用圖示 */}
      <button
        onClick={() => setType('dash')}
        className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors border ${
          animationType === 'dash'
            ? 'bg-sky-600 border-sky-500 text-white'
            : 'bg-slate-800/90 border-slate-600 text-slate-400 hover:bg-slate-700 hover:text-slate-300'
        }`}
        title="虛線流動動畫"
      >
        {/* 虛線圖示 */}
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 10h4M8 10h4M14 10h4" strokeLinecap="round" strokeDasharray="4 2" />
        </svg>
      </button>

      <button
        onClick={() => setType('particle')}
        className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors border ${
          animationType === 'particle'
            ? 'bg-sky-600 border-sky-500 text-white'
            : 'bg-slate-800/90 border-slate-600 text-slate-400 hover:bg-slate-700 hover:text-slate-300'
        }`}
        title="粒子移動動畫"
      >
        <Circle className="w-4 h-4" fill="currentColor" />
      </button>

      <button
        onClick={() => setType('both')}
        className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors border ${
          animationType === 'both'
            ? 'bg-sky-600 border-sky-500 text-white'
            : 'bg-slate-800/90 border-slate-600 text-slate-400 hover:bg-slate-700 hover:text-slate-300'
        }`}
        title="虛線 + 粒子動畫"
      >
        <Layers className="w-5 h-5" />
      </button>
    </div>
  );
}
