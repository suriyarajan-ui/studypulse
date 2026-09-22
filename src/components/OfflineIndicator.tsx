import React from "react";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import { WifiOff, RefreshCw } from "lucide-react";

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      id="pwa-offline-indicator"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-xl bg-slate-900/95 text-white px-3.5 py-2 text-xs font-medium shadow-xl border border-slate-700/80 backdrop-blur-md animate-in slide-in-from-bottom-2 duration-200"
    >
      <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
        <WifiOff className="w-3.5 h-3.5" />
      </div>
      <div>
        <p className="font-semibold text-white leading-tight">Offline Mode</p>
        <p className="text-[11px] text-slate-300">Using local cached data and schedule</p>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="ml-1 p-1 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white transition-colors"
        title="Retry connection"
      >
        <RefreshCw className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
