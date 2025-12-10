import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface ZoomControlsProps {
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

export function ZoomControls({ scale, onZoomIn, onZoomOut, onReset }: ZoomControlsProps) {
  const percentage = Math.round(scale * 100);

  return (
    <div className="absolute bottom-4 right-4 flex flex-col gap-1 z-10">
      {/* 放大按鈕 */}
      <button
        onClick={onZoomIn}
        className="w-10 h-10 flex items-center justify-center bg-slate-800/90 hover:bg-slate-700 rounded-lg transition-colors border border-slate-600"
        title="放大"
      >
        <ZoomIn className="w-5 h-5 text-slate-300" />
      </button>

      {/* 縮放百分比 */}
      <div className="w-10 h-10 flex items-center justify-center bg-slate-800/90 rounded-lg border border-slate-600">
        <span className="text-xs text-slate-300 font-medium">{percentage}%</span>
      </div>

      {/* 縮小按鈕 */}
      <button
        onClick={onZoomOut}
        className="w-10 h-10 flex items-center justify-center bg-slate-800/90 hover:bg-slate-700 rounded-lg transition-colors border border-slate-600"
        title="縮小"
      >
        <ZoomOut className="w-5 h-5 text-slate-300" />
      </button>

      {/* 重置按鈕 */}
      <button
        onClick={onReset}
        className="w-10 h-10 flex items-center justify-center bg-slate-800/90 hover:bg-slate-700 rounded-lg transition-colors border border-slate-600 mt-1"
        title="重置縮放"
      >
        <Maximize2 className="w-5 h-5 text-slate-300" />
      </button>
    </div>
  );
}
