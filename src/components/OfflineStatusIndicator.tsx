import React from 'react';
import { Wifi, WifiOff, HardDrive, CheckCircle2 } from 'lucide-react';
import { useOnlineStatus } from '../utils/useOnlineStatus';

interface Props {
  lastSavedText: string;
}

export const OfflineStatusIndicator: React.FC<Props> = ({ lastSavedText }) => {
  const isOnline = useOnlineStatus();

  return (
    <div className="flex items-center gap-1.5 text-xs select-none">
      {!isOnline ? (
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-medium animate-pulse" title="Working completely offline. All edits and manuscript changes are auto-saved to device storage.">
          <WifiOff className="w-3 h-3 text-amber-400 shrink-0" />
          <span className="hidden xs:inline">Offline Mode</span>
          <span className="text-[10px] text-amber-200 font-mono-data">· Saved</span>
        </div>
      ) : (
        <div className="flex items-center gap-1 text-[11px] text-stone-300 font-medium">
          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
          <span className="truncate max-w-[130px] sm:max-w-none">{lastSavedText}</span>
        </div>
      )}
    </div>
  );
};
