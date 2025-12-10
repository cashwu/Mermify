import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { exportToAPNG, downloadBlob } from '../lib/export-apng';
import { useAnimationStore } from '../stores/animation-store';

interface ExportButtonProps {
  getSvgElement: () => SVGSVGElement | null;
}

export function ExportButton({ getSvgElement }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { speed } = useAnimationStore();

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
        duration: 2 / speed, // 根據速度調整動畫時長
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
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="flex items-center gap-2 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg transition-colors text-sm font-medium"
      title="Export as Animated PNG"
    >
      {isExporting ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Exporting...</span>
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          <span>Export APNG</span>
        </>
      )}
    </button>
  );
}
