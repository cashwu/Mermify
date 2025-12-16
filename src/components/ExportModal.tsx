import { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export type ExportScale = 1 | 2 | 3;

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (options: { scale: ExportScale; transparent: boolean }) => void;
  scale: ExportScale;
  setScale: (scale: ExportScale) => void;
  transparent: boolean;
  setTransparent: (transparent: boolean) => void;
  isExporting: boolean;
}

const SCALE_OPTIONS: { value: ExportScale; label: string; description: string }[] = [
  { value: 1, label: '1x', description: '原始大小' },
  { value: 2, label: '2x', description: '2 倍大小' },
  { value: 3, label: '3x', description: '3 倍大小' },
];

export function ExportModal({
  isOpen,
  onClose,
  onExport,
  scale,
  setScale,
  transparent,
  setTransparent,
  isExporting,
}: ExportModalProps) {
  // ESC 關閉
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isExporting) {
        onClose();
      }
    },
    [onClose, isExporting]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const handleExport = () => {
    onExport({ scale, transparent });
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isExporting) {
      onClose();
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={handleBackdropClick}
    >
      <div className="bg-slate-800 border border-slate-600 rounded-xl shadow-2xl w-[320px] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
          <h2 className="text-base font-medium text-slate-200">匯出 APNG 動畫</h2>
          <button
            onClick={onClose}
            disabled={isExporting}
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-700 rounded transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 py-4 space-y-4">
          {/* Scale Options */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              圖片大小
            </label>
            <div className="space-y-1">
              {SCALE_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                    scale === option.value
                      ? 'bg-sky-600/20 border border-sky-500'
                      : 'bg-slate-700/50 border border-transparent hover:bg-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="scale"
                    value={option.value}
                    checked={scale === option.value}
                    onChange={() => setScale(option.value)}
                    className="w-4 h-4 text-sky-500 bg-slate-700 border-slate-500 focus:ring-sky-500 focus:ring-offset-slate-800"
                  />
                  <span className="text-sm text-slate-200">
                    {option.label}
                    <span className="text-slate-400 ml-2">({option.description})</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Transparent Option */}
          <div>
            <label
              className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                transparent
                  ? 'bg-sky-600/20 border border-sky-500'
                  : 'bg-slate-700/50 border border-transparent hover:bg-slate-700'
              }`}
            >
              <input
                type="checkbox"
                checked={transparent}
                onChange={(e) => setTransparent(e.target.checked)}
                className="w-4 h-4 text-sky-500 bg-slate-700 border-slate-500 rounded focus:ring-sky-500 focus:ring-offset-slate-800"
              />
              <span className="text-sm text-slate-200">透明背景</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-4 py-3 border-t border-slate-700 bg-slate-800/50">
          <button
            onClick={onClose}
            disabled={isExporting}
            className="px-4 py-2 text-sm text-slate-300 hover:text-slate-100 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
          >
            取消
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isExporting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                匯出中...
              </>
            ) : (
              '匯出'
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
