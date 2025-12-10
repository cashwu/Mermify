import { Github, Waves } from 'lucide-react';

export default function Header() {
  return (
    <header className="px-4 py-3 flex items-center justify-between bg-slate-800 border-b border-slate-700">
      <div className="flex items-center gap-3">
        <Waves className="w-6 h-6 text-sky-400" />
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
