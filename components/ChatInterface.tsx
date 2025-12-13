import React from 'react';
import { Bot, Sparkles, Hammer } from 'lucide-react';

const ChatInterface: React.FC = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-surface rounded-xl border border-zinc-800 overflow-hidden relative p-8">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 p-32 bg-secondary/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-md space-y-6 animate-in fade-in zoom-in duration-500">
        {/* Icon Container */}
        <div className="w-24 h-24 bg-zinc-900/80 backdrop-blur-sm rounded-3xl border border-zinc-700/50 flex items-center justify-center relative group shadow-2xl shadow-primary/5">
          <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full group-hover:bg-primary/30 transition-all duration-700"></div>
          <Bot className="w-10 h-10 text-primary relative z-10 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />

          {/* Floating Badge */}
          <div className="absolute -top-3 -right-3 bg-zinc-900 rounded-xl p-2 border border-zinc-700 shadow-lg transform rotate-12 group-hover:rotate-6 transition-transform">
            <Sparkles className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-white tracking-tight">SentinelBot AI</h2>

          <div className="flex items-center justify-center gap-2 text-primary font-medium bg-primary/10 py-1.5 px-4 rounded-full w-fit mx-auto border border-primary/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs uppercase tracking-wider font-semibold">Under Development</span>
          </div>

          <p className="text-zinc-400 text-sm leading-relaxed max-w-xs mx-auto">
            We are currently upgrading our neural networks to provide deeper security insights. The next generation of AI analysis is on its way.
          </p>
        </div>

        {/* Decorative Pill */}
        <div className="pt-2">
          <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800 text-xs text-zinc-500 hover:border-zinc-700 transition-colors cursor-default">
            <Hammer className="w-3 h-3" />
            <span>v3.0 System Upgrade in progress</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
