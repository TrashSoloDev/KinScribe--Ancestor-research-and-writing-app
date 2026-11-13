import React, { useRef, useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Sparkles, 
  Mic, 
  Compass, 
  Share2, 
  Download, 
  UploadCloud, 
  Smartphone, 
  Monitor, 
  Tablet, 
  MoreVertical,
  X,
  FileText
} from 'lucide-react';
import { OfflineStatusIndicator } from './OfflineStatusIndicator';

interface Props {
  activeTab: 'writer' | 'research';
  onSelectTab: (tab: 'writer' | 'research') => void;
  documentTitle: string;
  onUpdateDocumentTitle?: (title: string) => void;
  fontSizeScale: 'standard' | 'large' | 'xlarge';
  setFontSizeScale: (scale: 'standard' | 'large' | 'xlarge') => void;
  wordCount: number;
  chapterCount: number;
  citationCount: number;
  lastSavedText: string;
  deviceMode?: 'responsive' | 'android-phone' | 'android-tablet';
  onSelectDeviceMode?: (mode: 'responsive' | 'android-phone' | 'android-tablet') => void;
  onOpenVoiceRecorder?: () => void;
  onOpenMapModal?: () => void;
  onOpenKDPModal?: () => void;
  onOpenTutorial?: () => void;
  onCreateBackup?: () => void;
  onRestoreBackup?: (file: File) => void;
  onShare?: () => void;
}

export const SeniorAccessibilityBar: React.FC<Props> = ({
  activeTab,
  onSelectTab,
  documentTitle,
  onUpdateDocumentTitle,
  fontSizeScale,
  setFontSizeScale,
  wordCount,
  chapterCount,
  citationCount,
  lastSavedText,
  deviceMode = 'responsive',
  onSelectDeviceMode,
  onOpenVoiceRecorder,
  onOpenMapModal,
  onOpenKDPModal,
  onOpenTutorial,
  onCreateBackup,
  onRestoreBackup,
  onShare
}) => {
  const [showToolsMenu, setShowToolsMenu] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(documentTitle);
  const backupFileInputRef = useRef<HTMLInputElement>(null);

  const cycleFontSize = () => {
    if (fontSizeScale === 'standard') setFontSizeScale('large');
    else if (fontSizeScale === 'large') setFontSizeScale('xlarge');
    else setFontSizeScale('standard');
  };

  return (
    <>
      <header className="bg-slate-950 text-stone-100 border-b border-stone-700/80 px-3 sm:px-5 py-3 flex items-center justify-between gap-3 text-sm sticky top-0 z-30 shadow-lg no-print select-none min-h-[68px]">
        
        {/* Left: Brand + Navigation Tabs */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="flex items-center gap-3 shrink-0">
            <span className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-bold flex items-center justify-center font-serif-book text-lg shadow-sm">
              K
            </span>
            <span className="font-serif-book font-bold text-lg tracking-tight text-amber-100 hidden xs:inline">
              KinScribe
            </span>
          </div>

          {/* Desktop & Tablet Segmented Tab Control */}
          <nav className="hidden sm:flex items-center bg-slate-900 p-1 rounded-xl border border-stone-700 min-h-[48px]">
            <button
              onClick={() => onSelectTab('writer')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg font-bold text-sm transition-all min-h-[40px] ${
                activeTab === 'writer'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-slate-800'
              }`}
              title="Manuscript Writer"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-300" />
              <span>Manuscript</span>
            </button>

            <button
              onClick={() => onSelectTab('research')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg font-bold text-sm transition-all min-h-[40px] ${
                activeTab === 'research'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-slate-800'
              }`}
              title="Genealogy Research & Timeline"
            >
              <Search className="w-3.5 h-3.5 text-amber-300" />
              <span>Genealogy</span>
            </button>

          </nav>
        </div>

        {/* Center: Title & Live Auto-save Status */}
        <div className={`flex items-center gap-2 min-w-0 flex-1 justify-center px-2 ${isEditingTitle ? 'max-w-none' : 'max-w-md'}`}>
          {isEditingTitle && onUpdateDocumentTitle ? (
            <input
              type="text"
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              onBlur={() => {
                setIsEditingTitle(false);
                onUpdateDocumentTitle(tempTitle);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setIsEditingTitle(false);
                  onUpdateDocumentTitle(tempTitle);
                } else if (e.key === 'Escape') {
                  setIsEditingTitle(false);
                }
              }}
              autoFocus
              aria-label="Edit manuscript title"
              className="bg-stone-900 border border-amber-500 rounded px-2 py-1 text-xs text-white text-center w-full min-w-0 focus:outline-hidden"
            />
          ) : (
            <span
              onClick={() => setIsEditingTitle(true)}
              className="font-medium text-xs text-stone-300 truncate hover:text-amber-300 cursor-pointer text-center max-w-[160px] sm:max-w-xs"
              title="Click to edit manuscript title"
            >
              {documentTitle}
            </span>
          )}

          <div className={isEditingTitle ? 'hidden' : 'hidden md:block'}>
            <OfflineStatusIndicator lastSavedText={lastSavedText} />
          </div>
        </div>

        {/* Right: Actions & Companion Tools */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          <div className={`md:hidden ${isEditingTitle ? 'hidden' : ''}`}>
            <OfflineStatusIndicator lastSavedText={lastSavedText} />
          </div>

          {/* Quick Font Size Toggle */}
          <button
            onClick={cycleFontSize}
            className={`px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-stone-700 text-sm font-bold transition-colors min-h-[44px] ${isEditingTitle ? 'hidden md:inline-block' : ''}`}
            title="Adjust reading text scale"
          >
            Aa <span className="text-[10px] text-stone-300 font-mono-data">{fontSizeScale === 'standard' ? '1x' : fontSizeScale === 'large' ? '1.2x' : '1.4x'}</span>
          </button>

          {/* Desktop Companion Shortcuts */}
          {onOpenVoiceRecorder && (
            <button
              onClick={onOpenVoiceRecorder}
              className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 text-xs font-medium transition-colors"
              title="Grandpa's Voice Memories Dictation"
            >
              <Mic className="w-3.5 h-3.5 text-red-400" />
              <span>Voice</span>
            </button>
          )}

          {onOpenMapModal && (
            <button
              onClick={onOpenMapModal}
              className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 text-xs font-medium transition-colors"
              title="Fitts Village Ancestral Map"
            >
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>Map</span>
            </button>
          )}

          {onOpenKDPModal && (
            <button
              onClick={onOpenKDPModal}
              className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-900 hover:bg-amber-800 text-amber-100 border border-amber-800 text-xs font-bold transition-colors"
              title="Amazon KDP 6x9 Export"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-300" />
              <span>KDP Export</span>
            </button>
          )}

          {/* Mobile Tools Overflow Menu */}
          <button
            onClick={() => setShowToolsMenu(true)}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            title="More Options & Tools"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

        </div>
      </header>

      {/* TOOLS & COMPANION MODAL SHEET */}
      {showToolsMenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white max-w-sm w-full max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border border-stone-300 p-5 text-stone-900 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-amber-600 text-white font-bold flex items-center justify-center text-xs">K</span>
                <h3 className="font-bold text-stone-900 text-sm">Companion Tools & Options</h3>
              </div>
              <button onClick={() => setShowToolsMenu(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {onOpenTutorial && (
                <button
                  onClick={() => { setShowToolsMenu(false); onOpenTutorial(); }}
                  className="w-full p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 flex items-center gap-3 text-left transition-colors font-semibold text-amber-950"
                >
                  <Sparkles className="w-4 h-4 text-amber-700" />
                  <div>
                    <span className="block">Guided Introduction</span>
                    <span className="text-[11px] text-amber-700 font-normal">Walk through the main features</span>
                  </div>
                </button>
              )}

              {onCreateBackup && (
                <button
                  onClick={() => { setShowToolsMenu(false); onCreateBackup(); }}
                  className="w-full p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 flex items-center gap-3 text-left transition-colors font-semibold text-blue-950"
                >
                  <Download className="w-4 h-4 text-blue-700" />
                  <div>
                    <span className="block">Back Up Family History</span>
                    <span className="text-[11px] text-blue-700 font-normal">Download chapters, research, citations, and photos</span>
                  </div>
                </button>
              )}

              {onRestoreBackup && (
                <>
                  <button
                    onClick={() => backupFileInputRef.current?.click()}
                    className="w-full p-2.5 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 flex items-center gap-3 text-left transition-colors font-semibold"
                  >
                    <UploadCloud className="w-4 h-4 text-stone-700" />
                    <div>
                      <span className="block text-stone-900">Restore a Backup</span>
                      <span className="text-[11px] text-stone-500 font-normal">Replace this device's saved work from a KinScribe file</span>
                    </div>
                  </button>
                  <input
                    ref={backupFileInputRef}
                    type="file"
                    accept=".json,application/json"
                    className="hidden"
                    onChange={event => {
                      const file = event.target.files?.[0];
                      if (file) onRestoreBackup(file);
                      event.target.value = '';
                    }}
                  />
                </>
              )}

              {onOpenVoiceRecorder && (
                <button
                  onClick={() => { setShowToolsMenu(false); onOpenVoiceRecorder(); }}
                  className="w-full p-2.5 rounded-xl bg-stone-50 hover:bg-amber-50 border border-stone-200 flex items-center gap-3 text-left transition-colors font-semibold"
                >
                  <Mic className="w-4 h-4 text-red-500" />
                  <div>
                    <span className="block text-stone-900">Voice Dictation & Memories</span>
                    <span className="text-[11px] text-stone-500 font-normal">Record oral stories directly into current chapter</span>
                  </div>
                </button>
              )}

              {onOpenMapModal && (
                <button
                  onClick={() => { setShowToolsMenu(false); onOpenMapModal(); }}
                  className="w-full p-2.5 rounded-xl bg-stone-50 hover:bg-amber-50 border border-stone-200 flex items-center gap-3 text-left transition-colors font-semibold"
                >
                  <Compass className="w-4 h-4 text-amber-700" />
                  <div>
                    <span className="block text-stone-900">Fitts Village Land & Coastal Map</span>
                    <span className="text-[11px] text-stone-500 font-normal">Explore historic beachfront wharves and deeds</span>
                  </div>
                </button>
              )}

              {onOpenKDPModal && (
                <button
                  onClick={() => { setShowToolsMenu(false); onOpenKDPModal(); }}
                  className="w-full p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 flex items-center gap-3 text-left transition-colors font-semibold text-amber-950"
                >
                  <BookOpen className="w-4 h-4 text-amber-700" />
                  <div>
                    <span className="block">Amazon KDP Export (6x9 Paperback)</span>
                    <span className="text-[11px] text-amber-700 font-normal">Compile manuscript and verified footnotes</span>
                  </div>
                </button>
              )}

              {onShare && (
                <button
                  onClick={() => { setShowToolsMenu(false); onShare(); }}
                  className="w-full p-2.5 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 flex items-center gap-3 text-left transition-colors font-semibold"
                >
                  <Share2 className="w-4 h-4 text-blue-600" />
                  <div>
                    <span className="block text-stone-900">Share Manuscript</span>
                    <span className="text-[11px] text-stone-500 font-normal">Share family book link with relatives</span>
                  </div>
                </button>
              )}

            </div>

            {/* Device Viewport Switcher */}
            {onSelectDeviceMode && (
              <div className="pt-2 border-t border-stone-200">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1.5">
                  Preview Layout:
                </span>
                <div className="grid grid-cols-3 gap-1 bg-stone-100 p-1 rounded-xl">
                  <button
                    onClick={() => { onSelectDeviceMode('responsive'); setShowToolsMenu(false); }}
                    className={`py-1 text-xs rounded-lg font-bold flex items-center justify-center gap-1 ${
                      deviceMode === 'responsive' ? 'bg-white shadow-xs text-stone-900' : 'text-stone-600'
                    }`}
                  >
                    <Monitor className="w-3 h-3" /> Full
                  </button>
                  <button
                    onClick={() => { onSelectDeviceMode('android-phone'); setShowToolsMenu(false); }}
                    className={`py-1 text-xs rounded-lg font-bold flex items-center justify-center gap-1 ${
                      deviceMode === 'android-phone' ? 'bg-emerald-600 text-white shadow-xs' : 'text-stone-600'
                    }`}
                  >
                    <Smartphone className="w-3 h-3" /> Phone
                  </button>
                  <button
                    onClick={() => { onSelectDeviceMode('android-tablet'); setShowToolsMenu(false); }}
                    className={`py-1 text-xs rounded-lg font-bold flex items-center justify-center gap-1 ${
                      deviceMode === 'android-tablet' ? 'bg-emerald-600 text-white shadow-xs' : 'text-stone-600'
                    }`}
                  >
                    <Tablet className="w-3 h-3" /> Tablet
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowToolsMenu(false)}
                className="px-4 py-2 bg-stone-900 text-white font-bold rounded-xl text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
