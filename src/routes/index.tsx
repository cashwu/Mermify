import { createFileRoute } from '@tanstack/react-router';
import { useState, useCallback, useRef, useEffect } from 'react';
import { MermaidRenderer } from '../components/MermaidRenderer';
import { CodeEditor } from '../components/CodeEditor';
import { AnimationController } from '../components/AnimationController';
import { DEFAULT_MERMAID_CODE } from '../lib/mermaid-config';

export const Route = createFileRoute('/')({
  component: App,
});

function App() {
  const [code, setCode] = useState(DEFAULT_MERMAID_CODE);
  const [debouncedCode, setDebouncedCode] = useState(DEFAULT_MERMAID_CODE);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  return (
    <div className="flex flex-col h-screen bg-slate-900">
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Code Editor */}
        <div className="w-1/2 border-r border-slate-700 flex flex-col">
          <div className="px-4 py-2 bg-slate-800 border-b border-slate-700">
            <h2 className="text-sm font-medium text-slate-300">Mermaid Code</h2>
          </div>
          <div className="flex-1 overflow-hidden">
            <CodeEditor value={code} onChange={handleCodeChange} />
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className="w-1/2 flex flex-col bg-slate-900">
          <div className="px-4 py-2 bg-slate-800 border-b border-slate-700">
            <h2 className="text-sm font-medium text-slate-300">Preview</h2>
          </div>
          <div className="flex-1 overflow-auto">
            <MermaidRenderer code={debouncedCode} />
          </div>
        </div>
      </div>

      {/* Bottom - Animation Controller */}
      <AnimationController />
    </div>
  );
}
