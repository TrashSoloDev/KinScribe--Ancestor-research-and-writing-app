import React from 'react';
import { BookOpen, Search, Mic, Compass } from 'lucide-react';

interface Props {
  activeTab: 'writer' | 'research';
  onSelectTab: (tab: 'writer' | 'research') => void;
  onOpenSearchAssistant?: () => void;
  onOpenVoiceRecorder?: () => void;
  onShare?: () => void;
}

export const AndroidBottomNav: React.FC<Props> = ({
  activeTab,
  onSelectTab,
  onOpenSearchAssistant,
  onOpenVoiceRecorder
}) => {
  return (
    <nav 
      aria-label="Mobile Navigation"
      className="sticky bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-stone-700 text-stone-200 px-3 py-2 flex items-center justify-between shadow-[0_-8px_24px_rgba(15,23,42,0.45)] no-print"
    >
      <div className="flex items-center gap-2 w-full max-w-md mx-auto justify-around">
        
        {/* Tab 1: Manuscript Writer */}
        <button
          onClick={() => onSelectTab('writer')}
          className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm transition-all min-h-[48px] ${
            activeTab === 'writer'
              ? 'bg-amber-600/25 text-amber-200 font-bold border border-amber-500/40 shadow-sm'
              : 'text-stone-300 hover:text-white hover:bg-slate-800/80 font-medium'
          }`}
          title="Manuscript Book Writer"
        >
          <BookOpen className={`w-4 h-4 ${activeTab === 'writer' ? 'text-amber-400' : 'text-stone-400'}`} />
          <span>My Book</span>
        </button>

        {/* Tab 2: Genealogy Research */}
        <button
          onClick={() => onSelectTab('research')}
          className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm transition-all min-h-[48px] ${
            activeTab === 'research'
              ? 'bg-amber-600/25 text-amber-200 font-bold border border-amber-500/40 shadow-sm'
              : 'text-stone-300 hover:text-white hover:bg-slate-800/80 font-medium'
          }`}
          title="Genealogy Research & Timeline"
        >
          <Search className={`w-4 h-4 ${activeTab === 'research' ? 'text-amber-400' : 'text-stone-400'}`} />
          <span>Research</span>
        </button>

        {/* Quick Voice / Oral Memories Recording shortcut */}
        {onOpenVoiceRecorder && (
          <button
            onClick={onOpenVoiceRecorder}
            className="p-3 rounded-full text-stone-300 hover:text-red-300 hover:bg-slate-800/80 transition-colors min-w-[48px] min-h-[48px]"
            title="Record Oral Memory Dictation"
          >
            <Mic className="w-5 h-5 text-red-400" />
          </button>
        )}

        {/* Quick Search Assistant */}
        {onOpenSearchAssistant && (
          <button
            onClick={onOpenSearchAssistant}
            className="p-3 rounded-full text-stone-300 hover:text-amber-200 hover:bg-slate-800/80 transition-colors min-w-[48px] min-h-[48px]"
            title="Quick Archival Search"
          >
            <Compass className="w-5 h-5 text-amber-400" />
          </button>
        )}

      </div>
    </nav>
  );
};
