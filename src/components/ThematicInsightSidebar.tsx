import React, { useState, useMemo } from 'react';
import { ThematicInsight } from '../utils/thematicInsights';
import { HistoricalSearchQuery } from '../types/genealogy';
import { 
  Lightbulb, 
  MapPin, 
  Anchor, 
  BookOpen, 
  Sparkles, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp,
  Calendar, 
  Compass, 
  Filter, 
  PlusCircle, 
  X, 
  Layers, 
  History, 
  Search, 
  ExternalLink, 
  Quote, 
  Clock, 
  Check, 
  Copy, 
  RotateCcw,
  BookMarked
} from 'lucide-react';

interface Props {
  insights: ThematicInsight[];
  activeThemeId: string | null;
  onSelectTheme: (themeId: string | null) => void;
  onFilterByFactIds: (factIds: string[], themeName: string) => void;
  onDraftChapterFromTheme?: (title: string, prompt: string) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
  recentSearches?: HistoricalSearchQuery[];
  onFilterTimelineByKeyword?: (keyword: string) => void;
  onInsertExplanationToDraft?: (text: string) => void;
}

export const ThematicInsightSidebar: React.FC<Props> = ({
  insights,
  activeThemeId,
  onSelectTheme,
  onFilterByFactIds,
  onDraftChapterFromTheme,
  isOpen,
  onToggleOpen,
  recentSearches = [],
  onFilterTimelineByKeyword,
  onInsertExplanationToDraft
}) => {
  // Sidebar tab: 'themes' | 'recent_searches'
  const [sidebarTab, setSidebarTab] = useState<'themes' | 'recent_searches'>('themes');
  const [expandedThemeId, setExpandedThemeId] = useState<string | null>(insights[0]?.id || null);
  const [expandedSearchId, setExpandedSearchId] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const getCategoryIcon = (category: ThematicInsight['category']) => {
    switch (category) {
      case 'occupation':
        return <Anchor className="w-4 h-4 text-amber-700" />;
      case 'location':
        return <MapPin className="w-4 h-4 text-emerald-700" />;
      case 'diaspora':
        return <Compass className="w-4 h-4 text-blue-700" />;
      case 'cultural':
      case 'milestone':
      default:
        return <Sparkles className="w-4 h-4 text-purple-700" />;
    }
  };

  const getCategoryColor = (category: ThematicInsight['category']) => {
    switch (category) {
      case 'occupation':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'location':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'diaspora':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'cultural':
      case 'milestone':
      default:
        return 'bg-purple-100 text-purple-900 border-purple-300';
    }
  };

  // Filter recent searches by user keyword
  const filteredSearches = useMemo(() => {
    if (!searchFilter.trim()) return recentSearches;
    const q = searchFilter.toLowerCase();
    return recentSearches.filter(s => 
      s.term.toLowerCase().includes(q) || 
      (s.context && s.context.toLowerCase().includes(q)) ||
      (s.resultSnippet && s.resultSnippet.toLowerCase().includes(q))
    );
  }, [recentSearches, searchFilter]);

  const handleCopySummary = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setActionNotice('Copied historical summary to clipboard!');
    setTimeout(() => {
      setCopiedId(null);
      setActionNotice(null);
    }, 2500);
  };

  return (
    <div className={`transition-all duration-300 flex flex-col shrink-0 ${
      isOpen 
        ? 'w-full lg:w-80 xl:w-96' 
        : 'w-auto'
    }`}>
      {/* Collapsed tab button when closed */}
      {!isOpen && (
        <button
          onClick={onToggleOpen}
          className="bg-amber-900 text-amber-100 hover:bg-amber-800 p-3 rounded-xl shadow-md border border-amber-700 flex items-center gap-2 text-xs font-bold transition-all self-start"
          title="Open Research Sidebar (Thematic Insights & Recent Searches)"
        >
          <Lightbulb className="w-4 h-4 text-amber-300 animate-pulse" />
          <span className="hidden sm:inline">Research Sidebar</span>
          <span className="bg-amber-800 text-amber-200 px-1.5 py-0.5 rounded text-[10px] font-mono-data">
            {recentSearches.length > 0 ? recentSearches.length : insights.length}
          </span>
        </button>
      )}

      {/* Expanded Sidebar Body */}
      {isOpen && (
        <aside className="bg-white rounded-2xl border border-stone-200 shadow-sm flex flex-col h-full max-h-[820px] overflow-hidden">
          
          {/* Header */}
          <div className="p-3.5 sm:p-4 bg-gradient-to-r from-amber-50 to-orange-50/50 border-b border-amber-200/80 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center shadow-xs">
                {sidebarTab === 'themes' ? (
                  <Lightbulb className="w-4 h-4 text-amber-100" />
                ) : (
                  <History className="w-4 h-4 text-amber-100" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-serif-book font-bold text-sm text-stone-900">
                    {sidebarTab === 'themes' ? 'Thematic Insights' : 'Recent Historical Searches'}
                  </h3>
                  <span className="bg-amber-200/80 text-amber-900 text-[10px] font-bold px-1.5 py-0.2 rounded-full font-mono-data">
                    {sidebarTab === 'themes' ? `${insights.length} themes` : `${recentSearches.length} queries`}
                  </span>
                </div>
                <p className="text-[11px] text-stone-600">
                  {sidebarTab === 'themes' 
                    ? 'Recurring family patterns & book ideas' 
                    : 'Jump back to previous manuscript context queries'}
                </p>
              </div>
            </div>

            <button
              onClick={onToggleOpen}
              className="p-1 text-stone-400 hover:text-stone-700 hover:bg-amber-100/50 rounded-lg transition-colors"
              title="Close Research Sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* ANDROID-NATIVE SEGMENTED TAB SWITCHER */}
          <div className="px-3 py-2 bg-stone-100/90 border-b border-stone-200">
            <div className="grid grid-cols-2 gap-1 bg-stone-200/80 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setSidebarTab('themes')}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  sidebarTab === 'themes'
                    ? 'bg-white text-stone-900 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-700" />
                <span>Thematic Insights</span>
                <span className={`text-[10px] font-mono-data px-1 rounded ${sidebarTab === 'themes' ? 'bg-amber-100 text-amber-900 font-bold' : 'bg-stone-100 text-stone-600'}`}>
                  {insights.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSidebarTab('recent_searches')}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  sidebarTab === 'recent_searches'
                    ? 'bg-white text-blue-900 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <History className="w-3.5 h-3.5 text-blue-700" />
                <span>Recent Searches</span>
                <span className={`text-[10px] font-mono-data px-1 rounded ${sidebarTab === 'recent_searches' ? 'bg-blue-100 text-blue-800 font-bold' : 'bg-stone-100 text-stone-600'}`}>
                  {recentSearches.length}
                </span>
              </button>
            </div>
          </div>

          {/* Quick Action Toast */}
          {actionNotice && (
            <div className="px-3 py-1.5 bg-stone-900 text-amber-200 text-[11px] font-semibold flex items-center gap-1.5">
              <Check className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>{actionNotice}</span>
            </div>
          )}

          {/* ==================== TAB 1: THEMATIC INSIGHTS ==================== */}
          {sidebarTab === 'themes' ? (
            <>
              {/* Active Filter Clear banner if filtered */}
              {activeThemeId && (
                <div className="px-4 py-2 bg-amber-100/80 border-b border-amber-200 flex items-center justify-between text-xs text-amber-950 font-medium">
                  <span className="truncate">
                    Showing timeline events for active theme
                  </span>
                  <button
                    onClick={() => onSelectTheme(null)}
                    className="text-amber-800 hover:text-amber-950 font-bold underline shrink-0 ml-2 text-[11px]"
                  >
                    Clear Theme
                  </button>
                </div>
              )}

              {/* List of Recurring Themes */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                {insights.length === 0 ? (
                  <div className="p-6 text-center text-stone-500 text-xs">
                    <Layers className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                    <p>No recurring patterns detected yet. Import GEDCOM or connect trees to analyze records.</p>
                  </div>
                ) : (
                  insights.map(item => {
                    const isSelected = activeThemeId === item.id;
                    const isExpanded = expandedThemeId === item.id;

                    return (
                      <div
                        key={item.id}
                        className={`rounded-xl border transition-all text-xs overflow-hidden ${
                          isSelected
                            ? 'bg-amber-50/70 border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
                            : 'bg-stone-50/60 hover:bg-stone-50 border-stone-200'
                        }`}
                      >
                        {/* Theme Card Top Bar */}
                        <div
                          onClick={() => setExpandedThemeId(isExpanded ? null : item.id)}
                          className="p-3 cursor-pointer flex items-start justify-between gap-2"
                        >
                          <div className="flex items-start gap-2.5 min-w-0">
                            <div className="p-1.5 rounded-lg bg-white border border-stone-200 shadow-2xs mt-0.5 shrink-0">
                              {getCategoryIcon(item.category)}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${getCategoryColor(item.category)}`}>
                                  {item.badge}
                                </span>
                                <span className="text-[10px] text-stone-500 font-mono-data flex items-center gap-0.5">
                                  <Calendar className="w-3 h-3 text-stone-400" /> {item.yearsSpan}
                                </span>
                              </div>
                              <h4 className="font-bold text-stone-900 mt-1 leading-snug">
                                {item.theme}
                              </h4>
                              <span className="text-[11px] text-stone-500 block mt-0.5">
                                {item.frequency} connected life events across timeline
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0 mt-1">
                            <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 font-bold font-mono-data text-[10px] flex items-center justify-center">
                              {item.frequency}
                            </span>
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-stone-400" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-stone-400" />
                            )}
                          </div>
                        </div>

                        {/* Expandable Chapter Writing Ideas & Timeline Filter */}
                        {isExpanded && (
                          <div className="px-3 pb-3 pt-1 border-t border-stone-200/60 space-y-2.5 bg-white/70">
                            
                            {/* Chapter Proposal Box */}
                            <div className="p-2.5 rounded-lg bg-amber-50/90 border border-amber-200 space-y-1.5">
                              <div className="flex items-center gap-1.5 text-amber-900 font-bold text-[11px]">
                                <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                                <span>Recommended Chapter Idea:</span>
                              </div>
                              <h5 className="font-serif-book font-bold text-stone-900 text-xs leading-snug">
                                "{item.chapterIdeaTitle}"
                              </h5>
                              <p className="text-[11px] text-stone-600 leading-normal">
                                {item.chapterPrompt}
                              </p>

                              {onDraftChapterFromTheme && (
                                <button
                                  onClick={() => onDraftChapterFromTheme(item.chapterIdeaTitle, item.chapterPrompt)}
                                  className="mt-1 w-full py-1.5 bg-amber-900 hover:bg-amber-950 text-white rounded-md text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
                                  title="Create a new draft chapter in your manuscript based on this theme"
                                >
                                  <PlusCircle className="w-3.5 h-3.5 text-amber-300" />
                                  <span>Draft as Book Chapter</span>
                                </button>
                              )}
                            </div>

                            {/* Recurring locations tags */}
                            {item.relatedLocations && item.relatedLocations.length > 0 && (
                              <div className="flex items-center gap-1.5 flex-wrap text-[10px] text-stone-500">
                                <span className="font-semibold text-stone-700">Recurring Places:</span>
                                {item.relatedLocations.map((loc, lIdx) => (
                                  <span key={lIdx} className="bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded border border-stone-200 truncate max-w-[200px]">
                                    {loc}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Action buttons: Filter Timeline */}
                            <div className="flex items-center gap-2 pt-1">
                              <button
                                onClick={() => {
                                  onSelectTheme(isSelected ? null : item.id);
                                  onFilterByFactIds(item.factIds, item.theme);
                                }}
                                className={`flex-1 py-1.5 px-2 rounded-lg font-semibold text-xs flex items-center justify-center gap-1 transition-all ${
                                  isSelected
                                    ? 'bg-amber-600 text-white shadow-2xs'
                                    : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300'
                                }`}
                              >
                                <Filter className="w-3.5 h-3.5" />
                                <span>{isSelected ? 'Viewing Filtered Events' : `Filter Timeline (${item.frequency})`}</span>
                              </button>
                            </div>

                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </>
          ) : (
            /* ==================== TAB 2: RECENT SEARCHES ==================== */
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              {/* Search Filter input */}
              <div className="p-3 border-b border-stone-200 bg-stone-50/80">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={e => setSearchFilter(e.target.value)}
                    placeholder="Filter recent queries..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500 text-stone-900"
                  />
                  {searchFilter && (
                    <button
                      onClick={() => setSearchFilter('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <div className="flex items-center justify-between text-[10px] text-stone-500 mt-1.5 px-0.5">
                  <span>Saved research notes</span>
                  <span>{filteredSearches.length} of {recentSearches.length} saved</span>
                </div>
              </div>

              {/* Recent Searches List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {filteredSearches.length === 0 ? (
                  <div className="p-6 text-center text-stone-500 text-xs space-y-2">
                    <History className="w-8 h-8 text-stone-300 mx-auto" />
                    <p className="font-semibold text-stone-700">No Recent Searches Found</p>
                    <p className="text-[11px] text-stone-400 max-w-xs mx-auto">
                      Historical searches you previously saved will appear here.
                    </p>
                  </div>
                ) : (
                  filteredSearches.map(query => {
                    const isExpanded = expandedSearchId === query.id;

                    return (
                      <div
                        key={query.id}
                        className="rounded-xl border border-stone-200 bg-stone-50/70 hover:bg-stone-50 hover:border-blue-300 transition-all text-xs overflow-hidden shadow-2xs"
                      >
                        {/* Top bar of search item */}
                        <div
                          onClick={() => setExpandedSearchId(isExpanded ? null : query.id)}
                          className="p-3 cursor-pointer space-y-1.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                                <Search className="w-3.5 h-3.5" />
                              </div>
                              <h4 className="font-serif-book font-bold text-stone-900 text-sm truncate">
                                "{query.term}"
                              </h4>
                            </div>

                            <div className="flex items-center gap-1 shrink-0 text-stone-400">
                              <span className="text-[10px] font-mono-data text-stone-500">
                                {query.timestamp}
                              </span>
                              {isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5 text-stone-500" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5 text-stone-500" />
                              )}
                            </div>
                          </div>

                          {/* Context / Chapter provenance */}
                          {query.context && (
                            <div className="text-[10px] text-blue-800 bg-blue-50/80 px-2 py-0.5 rounded border border-blue-200/80 truncate">
                              Context: {query.context}
                            </div>
                          )}

                          {/* Concise snippet preview */}
                          <p className="text-[11px] text-stone-600 line-clamp-2 leading-relaxed">
                            {query.resultSnippet}
                          </p>

                          <div className="flex items-center justify-between text-[10px] text-stone-400 pt-1">
                            <span className="flex items-center gap-1 text-emerald-700 font-medium">
                              <Check className="w-3 h-3 text-emerald-600" />
                              {query.sources?.length || 0} Archival Source{query.sources?.length === 1 ? '' : 's'}
                            </span>
                            <span className="text-blue-700 font-semibold hover:underline">
                              {isExpanded ? 'Hide Details' : 'View Full Context →'}
                            </span>
                          </div>
                        </div>

                        {/* Expandable detailed drawer */}
                        {isExpanded && (
                          <div className="px-3 pb-3 pt-2 bg-white border-t border-stone-200/80 space-y-3">
                            
                            {/* Full explanation text */}
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-stone-700 uppercase tracking-wider block">
                                Full Grounded Summary:
                              </span>
                              <div className="p-2.5 rounded-lg bg-stone-50 text-[11px] text-stone-700 leading-relaxed font-sans-ui whitespace-pre-line border border-stone-200">
                                {query.fullExplanation || query.resultSnippet}
                              </div>
                            </div>

                            {/* Verified source links */}
                            {query.sources && query.sources.length > 0 && (
                              <div className="space-y-1">
                                <span className="text-[10px] font-bold text-stone-700 uppercase tracking-wider block">
                                  Verified Sources & Archives:
                                </span>
                                <div className="space-y-1">
                                  {query.sources.map((src, sIdx) => (
                                    <a
                                      key={sIdx}
                                      href={src.uri}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-1.5 rounded bg-stone-50 hover:bg-blue-50 border border-stone-200 hover:border-blue-300 flex items-center justify-between text-[11px] text-stone-700 transition-colors group"
                                    >
                                      <span className="truncate group-hover:text-blue-700 font-medium">
                                        {src.title || 'Archival Link'}
                                      </span>
                                      <ExternalLink className="w-3 h-3 text-stone-400 group-hover:text-blue-600 shrink-0 ml-1" />
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Quick Jump & Filter Actions */}
                            <div className="grid grid-cols-2 gap-1.5 pt-1">
                              {/* Filter Timeline button */}
                              {onFilterTimelineByKeyword && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onFilterTimelineByKeyword(query.term);
                                    setActionNotice(`Filtered research timeline for "${query.term}"!`);
                                    setTimeout(() => setActionNotice(null), 3000);
                                  }}
                                  className="py-1.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 shadow-2xs transition-colors"
                                  title="Filter the family timeline for events matching this historical search"
                                >
                                  <Filter className="w-3 h-3 text-amber-700" />
                                  <span>Filter Timeline</span>
                                </button>
                              )}

                              {/* Cite Context in Manuscript */}
                              {onInsertExplanationToDraft && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onInsertExplanationToDraft(query.fullExplanation || query.resultSnippet);
                                    setActionNotice(`Inserted "${query.term}" note into active chapter!`);
                                    setTimeout(() => setActionNotice(null), 3000);
                                  }}
                                  className="py-1.5 px-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 shadow-2xs transition-colors"
                                  title="Insert this historical context note directly into your manuscript book"
                                >
                                  <Quote className="w-3 h-3 text-amber-300" />
                                  <span>Cite in Draft</span>
                                </button>
                              )}
                            </div>

                            {/* Copy summary button */}
                            <button
                              type="button"
                              onClick={() => handleCopySummary(query.id, query.fullExplanation || query.resultSnippet)}
                              className="w-full py-1 text-center text-[10px] text-stone-500 hover:text-stone-800 font-medium flex items-center justify-center gap-1"
                            >
                              {copiedId === query.id ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span className="text-emerald-700 font-bold">Copied to Clipboard!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy Context Summary</span>
                                </>
                              )}
                            </button>

                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Footer Guide Tip */}
          <div className="p-3 bg-stone-50 border-t border-stone-200 text-[11px] text-stone-600 flex items-start gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-tight">
              {sidebarTab === 'themes' ? (
                <span>Click <strong>"Filter Timeline"</strong> on any theme to focus on connected records across generations.</span>
              ) : (
                <span>Click <strong>"Filter Timeline"</strong> on any recent search to cross-reference historical context with family dates.</span>
              )}
            </p>
          </div>

        </aside>
      )}
    </div>
  );
};
