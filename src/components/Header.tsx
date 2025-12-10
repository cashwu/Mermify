import { Github } from 'lucide-react';

export default function Header() {
  return (
    <header className="px-4 py-3 flex items-center justify-between bg-slate-800 border-b border-slate-700">
      <div className="flex items-center gap-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-6 h-6 text-sky-400"
        >
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.29 7 12 12 20.71 7" />
          <line x1="12" y1="22" x2="12" y2="12" />
        </svg>
        <h1 className="text-lg font-semibold text-white">Mermify</h1>
      </div>
      <div className="flex items-center gap-2">
        <a
          href="https://github.com/cashwu/Mermify"
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-400 hover:text-white transition-colors"
          title="GitHub Repository"
        >
          <Github className="w-5 h-5" />
        </a>
      </div>
    </header>
  );
}
