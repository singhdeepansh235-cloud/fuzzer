import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';

interface TerminalLogProps {
  logs: LogEntry[];
}

const TerminalLog: React.FC<TerminalLogProps> = ({ logs }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="bg-black rounded-lg border border-zinc-800 overflow-hidden flex flex-col h-full shadow-inner">
      <div className="bg-zinc-900/80 px-4 py-2 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
          <span className="ml-2 font-mono text-xs text-muted">Engine Output Stream</span>
        </div>
        <span className="font-mono text-xs text-zinc-500">bash --verbose</span>
      </div>
      <div className="flex-1 p-4 overflow-y-auto font-mono text-sm space-y-1">
        {logs.length === 0 && (
          <div className="text-zinc-600 italic"> Waiting for scan initialization...</div>
        )}
        {logs.map((log) => (
          <div key={log.id} className="flex gap-3 animate-in fade-in slide-in-from-bottom-1 duration-100">
            <span className="text-zinc-600 shrink-0 text-xs py-0.5">[{log.timestamp}]</span>
            <span className={`font-bold shrink-0 text-xs py-0.5 w-16 ${
              log.module === 'RECON' ? 'text-blue-400' :
              log.module === 'FUZZ' ? 'text-purple-400' :
              log.module === 'REPORT' ? 'text-green-400' :
              'text-zinc-400'
            }`}>
              {log.module}
            </span>
            <span className={`break-all ${
              log.type === 'error' ? 'text-red-500' :
              log.type === 'success' ? 'text-emerald-400' :
              log.type === 'warning' ? 'text-yellow-400' :
              'text-zinc-300'
            }`}>
              {log.type === 'success' && '✓ '}
              {log.type === 'error' && '✕ '}
              {log.type === 'warning' && '⚠ '}
              {log.message}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default TerminalLog;