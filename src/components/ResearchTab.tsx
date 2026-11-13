import React, { lazy, Suspense, useState, useMemo, useEffect } from 'react';
import { Browser } from '@capacitor/browser';
import { 
  Ancestor, 
  TimelineFact, 
  RecordSource, 
  CitationFootnote,
  EventType,
  RecordConflict,
  ConflictingRecordOption,
  HistoricalSearchQuery
} from '../types/genealogy';
import { 
  buildFamilySearchRecordUrl, 
  buildAncestryRecordUrl 
} from '../utils/deduplication';
import { parseGedcom, generateSampleGedcomText } from '../utils/gedcomParser';
import { 
  ExternalLink, 
  Check, 
  ShieldCheck, 
  Upload, 
  Search, 
  UserCheck, 
  Calendar, 
  MapPin, 
  BookMarked, 
  FileText, 
  Layers, 
  Filter, 
  ArrowRight, 
  Info, 
  Sparkles, 
  RefreshCw, 
  ChevronRight, 
  Eye, 
  EyeOff, 
  Clock, 
  RotateCcw, 
  Compass, 
  Camera, 
  Star, 
  Lightbulb, 
  Columns, 
  Rows,
  Scale,
  AlertTriangle,
  GitFork,
  X
} from 'lucide-react';

import { analyzeThematicInsights, ThematicInsight } from '../utils/thematicInsights';
import { ThematicInsightSidebar } from './ThematicInsightSidebar';
import { AncestorProfileModal } from './AncestorProfileModal';
import { ConflictResolutionView } from './ConflictResolutionView';
import { LifeJourneyMap } from './LifeJourneyMap';
import { SearchAutoSuggest } from './SearchAutoSuggest';

const VisualTimelineChart = lazy(() => import('./VisualTimelineChart').then(module => ({ default: module.VisualTimelineChart })));
const FamilyTreeView = lazy(() => import('./FamilyTreeView').then(module => ({ default: module.FamilyTreeView })));

interface Props {
  ancestors: Ancestor[];
  facts: TimelineFact[];
  selectedAncestorId: string;
  onSelectAncestor: (id: string) => void;
  onInsertCitationToBook: (fact: TimelineFact, source: RecordSource) => void;
  onImportGedcomTree: (gedcomText: string, filename: string) => void;
  fontSizeScale: 'standard' | 'large' | 'xlarge';
  openSearchAssistantTrigger?: number;
  onOpenMapModal?: () => void;
  onOpenScrapbookModal?: () => void;
  starredFactIds?: string[];
  onToggleStarFact?: (factId: string) => void;
  onDraftChapterFromTheme?: (title: string, prompt: string) => void;
  conflicts?: RecordConflict[];
  onSelectPrimaryRecord?: (conflictId: string, primaryChoice: 'recordA' | 'recordB', notes?: string) => void;
  onCiteConflictRecord?: (record: ConflictingRecordOption, ancestorName: string) => void;
  recentSearches?: HistoricalSearchQuery[];
  onInsertExplanationToDraft?: (text: string) => void;
}


export const ResearchTab: React.FC<Props> = ({
  ancestors,
  facts,
  selectedAncestorId,
  onSelectAncestor,
  onInsertCitationToBook,
  onImportGedcomTree,
  fontSizeScale,
  openSearchAssistantTrigger,
  onOpenMapModal,
  onOpenScrapbookModal,
  starredFactIds = [],
  onToggleStarFact,
  onDraftChapterFromTheme,
  conflicts = [],
  onSelectPrimaryRecord,
  onCiteConflictRecord,
  recentSearches = [],
  onInsertExplanationToDraft
}) => {
  // Android App Mode: 'chronology' | 'conflicts' | 'tree' | 'journey'
  const [researchViewMode, setResearchViewMode] = useState<'chronology' | 'conflicts' | 'tree' | 'journey'>('chronology');
  const [isMobileSearchExpanded, setIsMobileSearchExpanded] = useState<boolean>(false);

  // Filter States: Source Provider, Starred Facts, Decade, Barbados Parish Presets, Event Type, Thematic Insight, and Search
  const [showFamilySearch, setShowFamilySearch] = useState<boolean>(true);
  const [showAncestry, setShowAncestry] = useState<boolean>(true);
  const [onlyDeduplicated, setOnlyDeduplicated] = useState<boolean>(false);
  const [showStarredOnly, setShowStarredOnly] = useState<boolean>(false);
  const [selectedDecade, setSelectedDecade] = useState<'all' | number>('all');
  const [selectedParish, setSelectedParish] = useState<'all' | 'st-james' | 'st-michael' | 'st-thomas' | 'st-peter' | 'overseas'>('all');
  const [selectedEventType, setSelectedEventType] = useState<'all' | 'vital' | 'census' | 'military'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Thematic Insight Sidebar State
  const [isThematicSidebarOpen, setIsThematicSidebarOpen] = useState<boolean>(true);
  const [activeThemeId, setActiveThemeId] = useState<string | null>(null);
  const [activeThemeName, setActiveThemeName] = useState<string | null>(null);
  const [themeFilterFactIds, setThemeFilterFactIds] = useState<string[] | null>(null);

  // Timeline Layout Mode: Stacked (Mobile-first vertical flow) or Split (Desktop side-by-side)
  const [timelineLayoutMode, setTimelineLayoutMode] = useState<'stacked' | 'split-side-by-side'>('stacked');

  const [showGedcomModal, setShowGedcomModal] = useState(false);
  const [showLiveSearchAssistant, setShowLiveSearchAssistant] = useState(false);
  const [citedFactId, setCitedFactId] = useState<string | null>(null);
  const [selectedFactId, setSelectedFactId] = useState<string | null>(null);
  const [profileAncestor, setProfileAncestor] = useState<Ancestor | null>(null);




  // Trigger from Android bottom navigation
  useEffect(() => {
    if (openSearchAssistantTrigger && openSearchAssistantTrigger > 0) {
      setShowLiveSearchAssistant(true);
    }
  }, [openSearchAssistantTrigger]);

  const [providerSignInError, setProviderSignInError] = useState<string | null>(null);

  const openProviderSignIn = async (url: string) => {
    setProviderSignInError(null);
    try {
      await Browser.open({ url });
    } catch {
      setProviderSignInError('Could not open the sign-in page. Check the internet connection and try again.');
    }
  };

  // Currently selected ancestor
  const selectedAncestor = useMemo(() => {
    return ancestors.find(a => a.id === selectedAncestorId) || ancestors[0];
  }, [ancestors, selectedAncestorId]);

  // Facts for selected ancestor
  const ancestorFacts = useMemo(() => {
    if (!selectedAncestor) return [];
    return facts.filter(f => f.ancestorId === selectedAncestor.id);
  }, [facts, selectedAncestor]);

  // Dynamically compute decades available in the selected ancestor's records
  const availableDecades = useMemo(() => {
    const decadeMap = new Map<number, number>();
    ancestorFacts.forEach(f => {
      const decade = Math.floor(f.year / 10) * 10;
      decadeMap.set(decade, (decadeMap.get(decade) || 0) + 1);
    });
    return Array.from(decadeMap.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([decade, count]) => ({ decade, count, label: `${decade}s` }));
  }, [ancestorFacts]);

  // Automated Thematic Analysis of Timeline Facts
  const thematicInsights = useMemo(() => {
    return analyzeThematicInsights(ancestorFacts);
  }, [ancestorFacts]);

  // Filtered facts matching source providers, decades, event types, thematic insights, and search query
  const displayFacts = useMemo(() => {
    return ancestorFacts.filter(fact => {
      const hasFS = fact.sources.some(s => s.provider === 'familysearch');
      const hasAncestry = fact.sources.some(s => s.provider === 'ancestry');
      const isStarred = starredFactIds.includes(fact.id) || Boolean(fact.isStarred);

      // -1. Thematic Insight Filter:
      if (activeThemeId && themeFilterFactIds) {
        if (!themeFilterFactIds.includes(fact.id)) return false;
      }

      // 0. Starred Only Filtering
      if (showStarredOnly && !isStarred) return false;

      // 1. Source Provider Filtering:
      // If neither is selected, hide all
      if (!showFamilySearch && !showAncestry) return false;
      // If FamilySearch is turned off, hide facts that only come from FamilySearch
      if (!showFamilySearch && hasFS && !hasAncestry) return false;
      // If Ancestry is turned off, hide facts that only come from Ancestry
      if (!showAncestry && hasAncestry && !hasFS) return false;

      // 2. Only Deduplicated (facts confirmed across both sites)
      if (onlyDeduplicated && !fact.isDeduplicated) return false;

      // 3. Decade Filtering:
      if (selectedDecade !== 'all') {
        const factDecade = Math.floor(fact.year / 10) * 10;
        if (factDecade !== selectedDecade) return false;
      }

      // 4. Barbados Parish & Archival Presets Filtering:
      if (selectedParish !== 'all') {
        const pLower = fact.place.toLowerCase();
        const dLower = fact.description.toLowerCase();
        if (selectedParish === 'st-james') {
          const isStJames = pLower.includes('st. james') || pLower.includes('fitts village') || pLower.includes('holetown') || pLower.includes('paynes bay');
          if (!isStJames) return false;
        } else if (selectedParish === 'st-michael') {
          const isStMichael = pLower.includes('st. michael') || pLower.includes('black rock') || pLower.includes('bridgetown') || dLower.includes('archives');
          if (!isStMichael) return false;
        } else if (selectedParish === 'st-thomas') {
          const isStThomas = pLower.includes('st. thomas') || dLower.includes('carlton');
          if (!isStThomas) return false;
        } else if (selectedParish === 'st-peter') {
          const isStPeter = pLower.includes('st. peter') || pLower.includes('speightstown');
          if (!isStPeter) return false;
        } else if (selectedParish === 'overseas') {
          const isOverseas = pLower.includes('uk') || pLower.includes('southampton') || fact.eventType === 'immigration' || fact.title.toLowerCase().includes('passenger');
          if (!isOverseas) return false;
        }
      }

      // 5. Event Type Filtering:
      if (selectedEventType === 'census' && fact.eventType !== 'census') return false;
      if (selectedEventType === 'vital' && !['birth', 'marriage', 'death', 'burial', 'baptism'].includes(fact.eventType)) return false;
      if (selectedEventType === 'military' && fact.eventType !== 'military') return false;

      // 6. Keyword Search:
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = fact.title.toLowerCase().includes(q);
        const inPlace = fact.place.toLowerCase().includes(q);
        const inDesc = fact.description.toLowerCase().includes(q);
        const inSources = fact.sources.some(s => s.sourceTitle.toLowerCase().includes(q) || s.collection.toLowerCase().includes(q));
        if (!inTitle && !inPlace && !inDesc && !inSources) return false;
      }

      return true;
    });
  }, [ancestorFacts, showFamilySearch, showAncestry, onlyDeduplicated, showStarredOnly, starredFactIds, selectedDecade, selectedParish, selectedEventType, searchQuery, activeThemeId, themeFilterFactIds]);

  // Count stats
  const totalFactsCount = ancestorFacts.length;
  const dedupedCount = ancestorFacts.filter(f => f.isDeduplicated).length;
  const starredCount = ancestorFacts.filter(f => starredFactIds.includes(f.id) || Boolean(f.isStarred)).length;
  const fsOnlyCount = ancestorFacts.filter(f => f.sources.every(s => s.provider === 'familysearch')).length;
  const ancOnlyCount = ancestorFacts.filter(f => f.sources.every(s => s.provider === 'ancestry')).length;
  const fsTotalCount = ancestorFacts.filter(f => f.sources.some(s => s.provider === 'familysearch')).length;
  const ancTotalCount = ancestorFacts.filter(f => f.sources.some(s => s.provider === 'ancestry')).length;
  const pendingConflictCount = conflicts.filter(c => c.status === 'pending').length;

  const isAnyFilterActive = 
    !showFamilySearch || 
    !showAncestry || 
    onlyDeduplicated || 
    showStarredOnly ||
    selectedDecade !== 'all' || 
    selectedParish !== 'all' ||
    selectedEventType !== 'all' || 
    Boolean(searchQuery.trim()) ||
    Boolean(activeThemeId);

  const resetAllFilters = () => {
    setShowFamilySearch(true);
    setShowAncestry(true);
    setOnlyDeduplicated(false);
    setShowStarredOnly(false);
    setSelectedDecade('all');
    setSelectedParish('all');
    setSelectedEventType('all');
    setSearchQuery('');
    setActiveThemeId(null);
    setActiveThemeName(null);
    setThemeFilterFactIds(null);
  };


  const handleCite = (fact: TimelineFact, source: RecordSource) => {
    onInsertCitationToBook(fact, source);
    setCitedFactId(fact.id);
    setTimeout(() => {
      setCitedFactId(null);
    }, 2500);
  };

  // Helper for text scale
  const scaleClass = 
    fontSizeScale === 'xlarge' ? 'text-lg' :
    fontSizeScale === 'large' ? 'text-base' : 'text-sm';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* SECTION 1: ARCHIVAL SYNC & DEDUPLICATION BAR */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-3 sm:p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Provider sign-in actions */}
          <button
            onClick={() => void openProviderSignIn('https://www.familysearch.org/en/identity/login/')}
            className="flex min-h-11 items-center gap-2 px-3 py-2 rounded-xl bg-blue-50/80 hover:bg-blue-100 border border-blue-200 text-blue-900 text-sm font-semibold transition-colors"
            title="Sign in to FamilySearch in a secure browser tab"
          >
            <span className="w-6 h-6 rounded-md bg-[#0076CE] text-white flex items-center justify-center font-bold text-[10px]">FS</span>
            <span>Sign in to FamilySearch</span>
            <ExternalLink className="w-4 h-4" />
          </button>

          {/* Ancestry sign-in */}
          <button
            onClick={() => void openProviderSignIn('https://www.ancestry.com/account/signin')}
            className="flex min-h-11 items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50/80 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 text-sm font-semibold transition-colors"
            title="Sign in to Ancestry in a secure browser tab"
          >
            <span className="w-6 h-6 rounded-md bg-[#1D7044] text-white flex items-center justify-center font-bold text-[10px]">A</span>
            <span>Sign in to Ancestry</span>
            <ExternalLink className="w-4 h-4" />
          </button>

          {/* Smart Deduplication Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>{dedupedCount} Deduplicated Proofs</span>
          </div>
        </div>

        <p className="w-full text-xs text-stone-600" role="note">
          Sign-in opens the provider's secure browser tab. KinScribe never asks for or stores these passwords, and does not sync provider accounts.
        </p>
        {providerSignInError && (
          <p className="w-full text-sm text-red-700" role="alert">{providerSignInError}</p>
        )}

        {/* Quick Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowGedcomModal(true)}
            className="px-2.5 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg flex items-center gap-1 transition-colors"
            title="Import GEDCOM Tree file"
          >
            <Upload className="w-3 h-3 text-stone-500" />
            <span>Import GEDCOM</span>
          </button>

          <button
            onClick={() => setShowLiveSearchAssistant(true)}
            className="p-2 sm:px-2.5 sm:py-1.5 text-xs font-semibold text-amber-950 bg-amber-100 hover:bg-amber-200 rounded-lg flex items-center gap-1 transition-colors min-h-[36px]"
            title="Search Assistant"
            aria-label="Search Assistant"
          >
            <Search className="w-4 h-4 sm:w-3 sm:h-3 text-amber-800" />
            <span className="hidden sm:inline">Search Assistant</span>
          </button>

        </div>
      </div>

      {/* ANDROID APP MODE SWITCHER: CHRONOLOGY TIMELINE vs. CONFLICT RESOLUTION vs. FAMILY TREE vs. JOURNEY MAP */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-2 sm:p-2.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 sm:gap-2 bg-stone-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => setResearchViewMode('chronology')}
            className={`flex-1 sm:flex-none py-2 px-3 sm:px-3.5 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all min-h-[44px] whitespace-nowrap ${
              researchViewMode === 'chronology'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Clock className="w-4 h-4 text-amber-700" />
            <span>Timeline</span>
          </button>

          <button
            type="button"
            onClick={() => setResearchViewMode('tree')}
            className={`flex-1 sm:flex-none py-2 px-3 sm:px-3.5 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all min-h-[44px] whitespace-nowrap ${
              researchViewMode === 'tree'
                ? 'bg-amber-800 text-white shadow-2xs'
                : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            <GitFork className={`w-4 h-4 ${researchViewMode === 'tree' ? 'text-amber-200' : 'text-amber-800'}`} />
            <span>Family Tree</span>
          </button>

          <button
            type="button"
            onClick={() => setResearchViewMode('journey')}
            className={`flex-1 sm:flex-none py-2 px-3 sm:px-3.5 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all min-h-[44px] whitespace-nowrap ${
              researchViewMode === 'journey'
                ? 'bg-amber-800 text-white shadow-2xs'
                : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            <Compass className={`w-4 h-4 ${researchViewMode === 'journey' ? 'text-amber-200' : 'text-amber-800'}`} />
            <span>Journey Map</span>
          </button>

          <button
            type="button"
            onClick={() => setResearchViewMode('conflicts')}
            className={`flex-1 sm:flex-none py-2 px-3 sm:px-3.5 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all min-h-[44px] whitespace-nowrap ${
              researchViewMode === 'conflicts'
                ? 'bg-amber-800 text-white shadow-2xs'
                : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            <Scale className={`w-4 h-4 ${researchViewMode === 'conflicts' ? 'text-amber-200' : 'text-amber-800'}`} />
            <span>Conflicts</span>
            {pendingConflictCount > 0 ? (
              <span className={`text-[10px] font-mono-data px-1.5 py-0.2 rounded-full font-bold ${
                researchViewMode === 'conflicts' ? 'bg-amber-950 text-amber-200' : 'bg-amber-200 text-stone-950'
              }`}>
                {pendingConflictCount}
              </span>
            ) : (
              <span className="text-[10px] font-mono-data px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                ✓
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-stone-600 px-2">
          <span>Active Person: <strong className="text-stone-900">{selectedAncestor?.name || 'All'}</strong></span>
          <span className="text-stone-300">·</span>
          <span className="font-mono-data text-amber-900 font-semibold">{facts.length} Verified Records</span>
        </div>
      </div>

      {researchViewMode === 'conflicts' ? (
        <ConflictResolutionView
          conflicts={conflicts}
          ancestors={ancestors}
          selectedAncestorId={selectedAncestorId}
          onSelectPrimaryRecord={onSelectPrimaryRecord || (() => {})}
          onCiteRecord={onCiteConflictRecord || (() => {})}
          fontSizeScale={fontSizeScale}
        />
      ) : researchViewMode === 'tree' ? (
        <Suspense fallback={<div className="p-6 text-center text-stone-600" role="status">Loading family tree...</div>}>
          <FamilyTreeView
            ancestors={ancestors}
            facts={facts}
            selectedAncestorId={selectedAncestorId}
            onSelectAncestor={(id) => onSelectAncestor(id)}
            onOpenProfileModal={(anc) => setProfileAncestor(anc)}
            onSwitchToChronology={() => setResearchViewMode('chronology')}
          />
        </Suspense>
      ) : researchViewMode === 'journey' ? (
        <LifeJourneyMap
          ancestors={ancestors}
          facts={facts}
          selectedAncestorId={selectedAncestorId}
          onSelectAncestor={(id) => onSelectAncestor(id)}
          onCiteInDraft={onInsertExplanationToDraft}
        />
      ) : (
        <>
          {/* SECTION 2: ANCESTOR SELECTION RAIL */}
          <div className="bg-white rounded-2xl border border-stone-200 p-3 sm:p-4 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-xs text-stone-600">
              <span className="font-bold uppercase tracking-wider text-stone-700 text-[11px]">Select Ancestor to Research:</span>
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={() => setResearchViewMode('journey')}
                  className="text-amber-800 hover:text-amber-950 font-bold flex items-center gap-1 text-[11px] bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-lg transition-colors border border-amber-200/60"
                  title="Switch to Life Journey Map"
                >
                  <Compass className="w-3 h-3 text-amber-700" />
                  <span>Life Map</span>
                </button>
                <button 
                  onClick={() => setResearchViewMode('tree')}
                  className="text-amber-800 hover:text-amber-950 font-bold flex items-center gap-1 text-[11px] bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-lg transition-colors border border-amber-200/60"
                  title="Switch to D3 Family Tree Diagram"
                >
                  <GitFork className="w-3 h-3 text-amber-700" />
                  <span>Tree</span>
                </button>
              </div>
            </div>

        {/* Smooth horizontal scrollable avatar rail */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {ancestors.map(anc => {
            const isSelected = anc.id === selectedAncestor?.id;
            const factCount = facts.filter(f => f.ancestorId === anc.id).length;

            return (
              <div
                key={anc.id}
                onClick={() => onSelectAncestor(anc.id)}
                className={`p-2.5 rounded-xl border transition-all flex items-center gap-2.5 cursor-pointer shrink-0 ${
                  isSelected 
                    ? 'bg-amber-50 border-amber-600 ring-2 ring-amber-600/20 shadow-xs' 
                    : 'bg-stone-50/70 hover:bg-stone-100 border-stone-200'
                }`}
              >
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectAncestor(anc.id);
                    setProfileAncestor(anc);
                  }}
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 hover:scale-105 transition-transform ${
                    isSelected ? 'bg-amber-700 text-white' : 'bg-stone-200 text-stone-700'
                  }`}
                  title="Click to view full Ancestor Profile"
                >
                  {anc.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                </div>

                <div className="min-w-0 pr-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-stone-900 text-xs whitespace-nowrap">
                      {anc.name}
                    </span>
                    <span className="text-[10px] font-mono-data text-stone-500">
                      ({anc.birthYear}–{anc.deathYear})
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-stone-500">
                    <span>{anc.relationship}</span>
                    <span>·</span>
                    <span className="font-medium text-amber-800">{factCount} records</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: SELECTED ANCESTOR DOSSIER & TIMELINE CONTROLS */}
      {selectedAncestor && (
        <div className="bg-white rounded-xl border border-stone-200 shadow-xs p-5 space-y-4">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-200">
            <div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setProfileAncestor(selectedAncestor)}
                  className="group flex items-center gap-1.5 text-left"
                  title="Click to open full Ancestor Profile, life dates & document gallery"
                >
                  <h2 className="text-xl sm:text-2xl font-bold font-serif-book text-stone-900 group-hover:text-amber-800 group-hover:underline transition-colors">
                    {selectedAncestor.name}
                  </h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 group-hover:bg-amber-200 transition-colors">
                    View Dossier ↗
                  </span>
                </button>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 font-medium border border-stone-200">
                  {selectedAncestor.relationship}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-3xl leading-relaxed">
                {selectedAncestor.bioSummary}
              </p>
              
              <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-stone-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-stone-400" />
                  Born {selectedAncestor.birthYear} · Passed {selectedAncestor.deathYear}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-stone-400" />
                  {selectedAncestor.birthPlace}
                </span>
              </div>
            </div>

            {/* Quick Actions & External Links for this Ancestor */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={() => setProfileAncestor(selectedAncestor)}
                className="px-3 py-1.5 text-xs font-bold text-amber-950 bg-amber-200 hover:bg-amber-300 rounded-lg border border-amber-300 flex items-center gap-1.5 shadow-2xs transition-colors"
                title="Open consolidated dossier, life dates, bio, and document gallery"
              >
                <UserCheck className="w-3.5 h-3.5 text-amber-800" />
                <span>Ancestor Profile</span>
              </button>

              <a
                href={buildFamilySearchRecordUrl(selectedAncestor.name.split(' ')[0], selectedAncestor.name.split(' ').slice(-1)[0], selectedAncestor.birthYear, selectedAncestor.birthPlace)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 text-xs font-medium text-[#0076CE] bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 flex items-center gap-1 transition-colors"
                title="Search this person on FamilySearch.org"
              >
                <span>FamilySearch</span> <ExternalLink className="w-3 h-3" />
              </a>

              <a
                href={buildAncestryRecordUrl(selectedAncestor.name.split(' ')[0], selectedAncestor.name.split(' ').slice(-1)[0], selectedAncestor.birthYear, selectedAncestor.birthPlace)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 text-xs font-medium text-[#1D7044] bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 flex items-center gap-1 transition-colors"
                title="Search this person on Ancestry.com"
              >
                <span>Ancestry</span> <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* SECTION 3.5: VISUAL HORIZONTAL TIMELINE CHART (When in Stacked view mode) */}
          {timelineLayoutMode === 'stacked' && (
            <Suspense fallback={<div className="min-h-32" role="status" aria-label="Loading timeline chart" />}>
              <VisualTimelineChart
                facts={ancestorFacts}
                ancestor={selectedAncestor}
                selectedFactId={selectedFactId}
                onSelectFact={(factId) => {
                  setSelectedFactId(factId);
                  const el = document.getElementById(`timeline_fact_${factId}`);
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    el.classList.add('ring-4', 'ring-amber-400');
                    setTimeout(() => el.classList.remove('ring-4', 'ring-amber-400'), 2200);
                  }
                }}
                starredFactIds={starredFactIds}
                onToggleStarFact={onToggleStarFact}
              />
            </Suspense>
          )}

          {/* SECTION 4: SOURCE PROVIDER & DECADE FILTER CONTROLS */}
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 space-y-3.5">


            
            {/* Row 1: Source Provider Show/Hide Filter Toggles */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5 text-amber-700" />
                  Sources:
                </span>

                {/* FamilySearch Toggle Button */}
                <button
                  onClick={() => setShowFamilySearch(!showFamilySearch)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                    showFamilySearch
                      ? 'bg-blue-50 border-blue-400 text-[#0076CE] shadow-2xs'
                      : 'bg-white border-stone-300 text-stone-400 line-through hover:text-stone-600'
                  }`}
                  title={showFamilySearch ? 'Click to hide FamilySearch records' : 'Click to show FamilySearch records'}
                >
                  {showFamilySearch ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>FamilySearch.org</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono-data ${showFamilySearch ? 'bg-[#0076CE] text-white' : 'bg-stone-200 text-stone-500'}`}>
                    {fsTotalCount}
                  </span>
                </button>

                {/* Ancestry Toggle Button */}
                <button
                  onClick={() => setShowAncestry(!showAncestry)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                    showAncestry
                      ? 'bg-emerald-50 border-emerald-400 text-[#1D7044] shadow-2xs'
                      : 'bg-white border-stone-300 text-stone-400 line-through hover:text-stone-600'
                  }`}
                  title={showAncestry ? 'Click to hide Ancestry.com records' : 'Click to show Ancestry.com records'}
                >
                  {showAncestry ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>Ancestry.com</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono-data ${showAncestry ? 'bg-[#1D7044] text-white' : 'bg-stone-200 text-stone-500'}`}>
                    {ancTotalCount}
                  </span>
                </button>

                {/* Only Deduplicated Toggle */}
                <button
                  onClick={() => setOnlyDeduplicated(!onlyDeduplicated)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                    onlyDeduplicated
                      ? 'bg-amber-600 text-white border-amber-700 shadow-2xs'
                      : 'bg-white border-stone-300 text-amber-900 hover:bg-amber-50'
                  }`}
                  title="Only show records found on both sites"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Deduplicated Proofs</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono-data ${onlyDeduplicated ? 'bg-amber-900 text-white' : 'bg-amber-100 text-amber-900'}`}>
                    {dedupedCount}
                  </span>
                </button>

                {/* Starred Discoveries Only Toggle */}
                <button
                  onClick={() => setShowStarredOnly(!showStarredOnly)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                    showStarredOnly
                      ? 'bg-amber-500 text-stone-950 border-amber-600 shadow-2xs font-bold ring-2 ring-amber-400/40'
                      : 'bg-white border-stone-300 text-amber-950 hover:bg-amber-50 hover:border-amber-400'
                  }`}
                  title="Filter to show only starred important discoveries flagged for your book"
                >
                  <Star className={`w-3.5 h-3.5 ${showStarredOnly ? 'fill-stone-950 text-stone-950' : 'fill-amber-400 text-amber-600'}`} />
                  <span>Starred Only</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono-data ${showStarredOnly ? 'bg-stone-950 text-amber-300 font-bold' : 'bg-amber-100 text-amber-900'}`}>
                    {starredCount}
                  </span>
                </button>
              </div>

              {/* Right: Layout Mode & Search */}
              <div className="flex items-center gap-2">
                {/* View Switcher: Side-by-Side vs Stacked */}
                <div className="hidden md:flex items-center bg-stone-200/70 p-0.5 rounded-lg border border-stone-300 text-xs">
                  <button
                    onClick={() => setTimelineLayoutMode('split-side-by-side')}
                    className={`px-2 py-1 rounded flex items-center gap-1 transition-colors ${
                      timelineLayoutMode === 'split-side-by-side'
                        ? 'bg-white shadow-2xs font-bold text-stone-900'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                    title="Display interactive timeline chart alongside the list of records"
                  >
                    <Columns className="w-3.5 h-3.5 text-amber-700" />
                    <span>Side-by-Side</span>
                  </button>
                  <button
                    onClick={() => setTimelineLayoutMode('stacked')}
                    className={`px-2 py-1 rounded flex items-center gap-1 transition-colors ${
                      timelineLayoutMode === 'stacked'
                        ? 'bg-white shadow-2xs font-bold text-stone-900'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                    title="Display interactive timeline chart stacked above the list"
                  >
                    <Rows className="w-3.5 h-3.5 text-stone-600" />
                    <span>Stacked</span>
                  </button>
                </div>

                {/* Mobile: Compact Search Icon button when collapsed, expanding bar with Auto-Suggest when clicked */}
                {!isMobileSearchExpanded ? (
                  <button
                    onClick={() => setIsMobileSearchExpanded(true)}
                    className="sm:hidden p-2 bg-white border border-stone-300 hover:border-amber-500 rounded-lg text-stone-700 min-h-[36px] min-w-[36px] flex items-center justify-center transition-colors shadow-2xs"
                    title="Search and filter records"
                    aria-label="Expand search bar"
                  >
                    <Search className="w-4 h-4 text-stone-700" />
                  </button>
                ) : (
                  <div className="sm:hidden flex-1 min-w-0 w-full animate-in fade-in duration-150">
                    <SearchAutoSuggest
                      value={searchQuery}
                      onChange={setSearchQuery}
                      onSelectAncestor={onSelectAncestor}
                      ancestors={ancestors}
                      facts={facts}
                      placeholder="Search ancestor, date, parish..."
                      inputClassName="border-2 border-amber-500"
                      autoFocus={true}
                      isMobile={true}
                      onClose={() => setIsMobileSearchExpanded(false)}
                    />
                  </div>
                )}

                {/* Desktop: Standard Keyword Search Input with Auto-Suggest */}
                <div className="hidden sm:block relative sm:w-64">
                  <SearchAutoSuggest
                    value={searchQuery}
                    onChange={setSearchQuery}
                    onSelectAncestor={onSelectAncestor}
                    ancestors={ancestors}
                    facts={facts}
                    placeholder="Search ancestor, date, parish..."
                  />
                </div>
              </div>
            </div>


            {/* Row 2: Decade Filter Timeline */}
            <div className="flex items-center gap-2 pt-2 border-t border-stone-200/80 overflow-x-auto pb-1">
              <span className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1 shrink-0">
                <Clock className="w-3.5 h-3.5 text-amber-700" />
                Decades:
              </span>

              {/* All Decades Button */}
              <button
                onClick={() => setSelectedDecade('all')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all shrink-0 ${
                  selectedDecade === 'all'
                    ? 'bg-stone-900 text-white shadow-2xs'
                    : 'bg-white text-stone-700 hover:bg-stone-200 border border-stone-300'
                }`}
              >
                All Decades ({totalFactsCount})
              </button>

              {/* Decade Pills */}
              {availableDecades.map(({ decade, count, label }) => {
                const isSelected = selectedDecade === decade;
                return (
                  <button
                    key={decade}
                    onClick={() => setSelectedDecade(isSelected ? 'all' : decade)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all shrink-0 font-mono-data flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-amber-800 text-white shadow-2xs ring-2 ring-amber-800/20'
                        : 'bg-white text-stone-700 hover:bg-amber-50 hover:border-amber-300 border border-stone-300'
                    }`}
                  >
                    <span>{label}</span>
                    <span className={`text-[10px] px-1 py-0.2 rounded ${isSelected ? 'bg-amber-950 text-amber-200' : 'bg-stone-100 text-stone-600'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Row 2.5: Barbados Parish & Archival Presets */}
            <div className="flex items-center gap-2 pt-2 border-t border-stone-200/80 overflow-x-auto pb-1">
              <span className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1 shrink-0">
                <MapPin className="w-3.5 h-3.5 text-amber-700" />
                Parish Archives:
              </span>

              <button
                onClick={() => setSelectedParish('all')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all shrink-0 ${
                  selectedParish === 'all'
                    ? 'bg-stone-900 text-white shadow-2xs'
                    : 'bg-white text-stone-700 hover:bg-stone-200 border border-stone-300'
                }`}
              >
                All Parishes
              </button>

              <button
                onClick={() => setSelectedParish(selectedParish === 'st-james' ? 'all' : 'st-james')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
                  selectedParish === 'st-james'
                    ? 'bg-amber-800 text-white shadow-2xs ring-2 ring-amber-800/20'
                    : 'bg-white text-stone-700 hover:bg-amber-50 hover:border-amber-300 border border-stone-300'
                }`}
              >
                <span>St. James (Fitts Village & Holetown)</span>
              </button>

              <button
                onClick={() => setSelectedParish(selectedParish === 'st-michael' ? 'all' : 'st-michael')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
                  selectedParish === 'st-michael'
                    ? 'bg-amber-800 text-white shadow-2xs ring-2 ring-amber-800/20'
                    : 'bg-white text-stone-700 hover:bg-amber-50 hover:border-amber-300 border border-stone-300'
                }`}
              >
                <span>St. Michael (Black Rock Dept of Archives)</span>
              </button>

              <button
                onClick={() => setSelectedParish(selectedParish === 'st-thomas' ? 'all' : 'st-thomas')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
                  selectedParish === 'st-thomas'
                    ? 'bg-amber-800 text-white shadow-2xs ring-2 ring-amber-800/20'
                    : 'bg-white text-stone-700 hover:bg-amber-50 hover:border-amber-300 border border-stone-300'
                }`}
              >
                <span>St. Thomas (Inland Plantations)</span>
              </button>

              <button
                onClick={() => setSelectedParish(selectedParish === 'overseas' ? 'all' : 'overseas')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
                  selectedParish === 'overseas'
                    ? 'bg-amber-800 text-white shadow-2xs ring-2 ring-amber-800/20'
                    : 'bg-white text-stone-700 hover:bg-amber-50 hover:border-amber-300 border border-stone-300'
                }`}
              >
                <span>Transatlantic & UK Diaspora</span>
              </button>
            </div>

            {/* Row 3: Active Filter Status & Reset */}
            <div className="flex items-center justify-between text-xs text-stone-600 pt-1 border-t border-stone-200/60">
              <div className="flex items-center gap-2 flex-wrap">
                <span>
                  Showing <strong>{displayFacts.length}</strong> of <strong>{totalFactsCount}</strong> life events
                </span>
                {selectedDecade !== 'all' && (
                  <span className="bg-amber-100 text-amber-900 font-mono-data px-2 py-0.2 rounded font-medium">
                    Decade: {selectedDecade}s
                  </span>
                )}
                {!showFamilySearch && (
                  <span className="bg-blue-100 text-[#0076CE] px-2 py-0.2 rounded font-medium line-through">
                    FamilySearch Hidden
                  </span>
                )}
                {!showAncestry && (
                  <span className="bg-emerald-100 text-[#1D7044] px-2 py-0.2 rounded font-medium line-through">
                    Ancestry Hidden
                  </span>
                )}
                {onlyDeduplicated && (
                  <span className="bg-amber-100 text-amber-900 px-2 py-0.2 rounded font-medium">
                    Deduplicated Only
                  </span>
                )}
                {showStarredOnly && (
                  <span className="bg-amber-400 text-stone-950 px-2 py-0.2 rounded font-bold flex items-center gap-1 shadow-2xs">
                    <Star className="w-3 h-3 fill-stone-950 text-stone-950" /> Starred Only ({starredCount})
                  </span>
                )}
                {activeThemeId && (
                  <span className="bg-amber-900 text-amber-100 px-2 py-0.2 rounded font-bold flex items-center gap-1 shadow-2xs border border-amber-700">
                    <Lightbulb className="w-3 h-3 text-amber-300" />
                    <span>Theme: {activeThemeName || 'Selected Theme'}</span>
                    <button 
                      onClick={() => {
                        setActiveThemeId(null);
                        setActiveThemeName(null);
                        setThemeFilterFactIds(null);
                      }}
                      className="hover:text-white ml-0.5"
                    >
                      ✕
                    </button>
                  </span>
                )}
                {selectedParish !== 'all' && (
                  <span className="bg-stone-200 text-stone-800 px-2 py-0.2 rounded font-medium">
                    Parish: {selectedParish}
                  </span>
                )}
              </div>

              {isAnyFilterActive && (
                <button
                  onClick={resetAllFilters}
                  className="flex items-center gap-1 text-amber-800 hover:text-amber-900 font-semibold hover:underline"
                >
                  <RotateCcw className="w-3 h-3" /> Reset Filters
                </button>
              )}
            </div>


          </div>

          {/* SECTION 5: CHRONOLOGICAL LIFE TIMELINE & THEMATIC INSIGHT SIDEBAR */}
          <div className="flex flex-col lg:flex-row items-start gap-5 pt-3">
            
            {/* Visual Interactive Timeline Chart alongside the list view (When in Side-by-Side mode) */}
            {timelineLayoutMode === 'split-side-by-side' && (
              <div className="w-full lg:w-96 xl:w-[420px] shrink-0 sticky top-16 z-20 space-y-3">
                <Suspense fallback={<div className="min-h-32" role="status" aria-label="Loading timeline chart" />}>
                  <VisualTimelineChart
                    facts={ancestorFacts}
                    ancestor={selectedAncestor}
                    selectedFactId={selectedFactId}
                    onSelectFact={(factId) => {
                      setSelectedFactId(factId);
                      const el = document.getElementById(`timeline_fact_${factId}`);
                      if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        el.classList.add('ring-4', 'ring-amber-400');
                        setTimeout(() => el.classList.remove('ring-4', 'ring-amber-400'), 2200);
                      }
                    }}
                    starredFactIds={starredFactIds}
                    onToggleStarFact={onToggleStarFact}
                  />
                </Suspense>
              </div>
            )}

            {/* Main Chronological Timeline Stream */}
            <div className="flex-1 w-full space-y-4">
              {displayFacts.length === 0 ? (

                <div className="text-center py-12 bg-stone-50 rounded-xl border border-dashed border-stone-300 p-6">
                  <Info className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                  <h4 className="font-semibold text-stone-800 text-sm">
                    {activeThemeId 
                      ? `No events found matching theme "${activeThemeName}"` 
                      : showStarredOnly 
                        ? 'No starred discoveries found for this ancestor' 
                        : 'No events found matching this filter'}
                  </h4>
                  <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
                    {activeThemeId
                      ? 'Try clearing the active theme in the Thematic Insights sidebar to see all chronological events.'
                      : showStarredOnly 
                        ? 'Click the ⭐ Star button on any fact card to pin important discoveries so you can easily reference them while writing.' 
                        : 'Try toggling FamilySearch or Ancestry sources back on, or clear decade filters.'}
                  </p>
                  <button
                    onClick={resetAllFilters}
                    className="mt-3 px-3 py-1.5 text-xs font-medium text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors inline-flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Show All {totalFactsCount} Records
                  </button>
                </div>
              ) : (
                displayFacts.map((fact, index) => {

                const hasFS = fact.sources.some(s => s.provider === 'familysearch');
                const hasAncestry = fact.sources.some(s => s.provider === 'ancestry');
                const isJustCited = citedFactId === fact.id;
                const isStarred = starredFactIds.includes(fact.id) || Boolean(fact.isStarred);

                return (
                  <div
                    key={fact.id}
                    id={`timeline_fact_${fact.id}`}
                    className={`rounded-xl border p-4 sm:p-5 transition-all ${
                      isStarred
                        ? 'bg-amber-50/20 border-amber-400 ring-1 ring-amber-300/60 shadow-sm'
                        : fact.isDeduplicated 
                          ? 'bg-white border-amber-300/80 shadow-xs hover:border-amber-400' 
                          : 'bg-white border-stone-200 shadow-xs hover:border-stone-300'
                    }`}
                  >
                    {/* Top Row: Year, Event Type, Star Button & Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
                      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                        {/* Year pill */}
                        <span className="font-mono-data font-bold text-base sm:text-lg text-amber-900 bg-amber-100/70 px-2.5 py-0.5 rounded-md">
                          {fact.year}
                        </span>

                        <h4 className="font-serif-book font-bold text-stone-900 text-base flex items-center gap-2">
                          <span>{fact.title}</span>
                          {isStarred && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-950 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                              <Star className="w-3 h-3 fill-amber-500 text-amber-600" /> Key Discovery
                            </span>
                          )}
                        </h4>
                      </div>

                      {/* Source badges & Star button */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Star Button */}
                        <button
                          onClick={() => onToggleStarFact?.(fact.id)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                            isStarred
                              ? 'bg-amber-100 border-amber-400 text-amber-950 shadow-2xs ring-1 ring-amber-400'
                              : 'bg-white border-stone-300 text-stone-600 hover:text-amber-800 hover:border-amber-300 hover:bg-amber-50/50'
                          }`}
                          title={isStarred ? 'Unstar this discovery' : 'Star this important discovery to flag for your book'}
                        >
                          <Star className={`w-3.5 h-3.5 ${isStarred ? 'fill-amber-500 text-amber-600' : 'text-stone-400'}`} />
                          <span>{isStarred ? 'Starred' : 'Star'}</span>
                        </button>

                        {fact.isDeduplicated ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300">
                            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                            Compiled & Deduplicated
                          </span>
                        ) : null}

                        {hasFS && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-[#0076CE] border border-blue-200">
                            FamilySearch
                          </span>
                        )}

                        {hasAncestry && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-[#1D7044] border border-emerald-200">
                            Ancestry
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Middle: Details, Date, Place, Narrative */}
                    <div className="py-3 space-y-2">
                      <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-stone-600">
                        <span className="flex items-center gap-1 text-stone-800">
                          <Calendar className="w-3.5 h-3.5 text-amber-700" />
                          {fact.dateStr}
                        </span>
                        <span className="flex items-center gap-1 text-stone-800">
                          <MapPin className="w-3.5 h-3.5 text-amber-700" />
                          {fact.place}
                        </span>
                      </div>

                      <p className={`text-stone-700 leading-relaxed ${scaleClass}`}>
                        {fact.description}
                      </p>

                      {fact.details && fact.details.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {fact.details.map((detail, dIdx) => (
                            <span 
                              key={dIdx} 
                              className="text-[11px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded border border-stone-200"
                            >
                              {detail}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Bottom: Source Proofs & Direct Clickable Verification Links */}
                    <div className="pt-3 border-t border-stone-100 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
                          Primary Sources & Verification Links ({fact.sources.length}):
                        </span>

                        <button
                          onClick={() => handleCite(fact, fact.sources[0])}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-all ${
                            isJustCited 
                              ? 'bg-emerald-600 text-white' 
                              : 'bg-stone-900 hover:bg-stone-800 text-amber-200'
                          }`}
                          title="Insert this verified fact as a footnote in your manuscript book"
                        >
                          {isJustCited ? (
                            <>
                              <Check className="w-3.5 h-3.5" /> Cited in Book!
                            </>
                          ) : (
                            <>
                              <BookMarked className="w-3.5 h-3.5 text-amber-400" /> Cite in Book
                            </>
                          )}
                        </button>
                      </div>

                      {/* Source proof cards with clickable links to where it was found */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {fact.sources.map(src => {
                          const isFS = src.provider === 'familysearch';

                          return (
                            <div 
                              key={src.id}
                              className={`p-3 rounded-lg border text-xs space-y-2 ${
                                isFS 
                                  ? 'bg-blue-50/40 border-blue-200/80' 
                                  : 'bg-emerald-50/40 border-emerald-200/80'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1.5">
                                    <span className={`font-bold ${isFS ? 'text-[#0076CE]' : 'text-[#1D7044]'}`}>
                                      {isFS ? 'FamilySearch' : 'Ancestry.com'}
                                    </span>
                                    <span className="text-[10px] text-stone-500 bg-white px-1.5 py-0.2 rounded border border-stone-200">
                                      {src.recordType}
                                    </span>
                                  </div>
                                  <h5 className="font-semibold text-stone-800">
                                    {src.sourceTitle}
                                  </h5>
                                </div>

                                {/* Direct click link to verify where it was found on the site */}
                                <a
                                  href={src.externalUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`px-2.5 py-1 rounded text-white font-semibold flex items-center gap-1 shrink-0 text-[11px] shadow-2xs hover:opacity-90 transition-opacity ${
                                    isFS ? 'bg-[#0076CE]' : 'bg-[#1D7044]'
                                  }`}
                                  title={`Verify this record directly on ${isFS ? 'FamilySearch.org' : 'Ancestry.com'}`}
                                >
                                  <span>Verify on {isFS ? 'FS' : 'Ancestry'}</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>

                              <p className="text-stone-600 font-mono-data text-[11px] leading-tight">
                                {src.citationText}
                              </p>

                              <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1 border-t border-stone-200/50">
                                <span>Collection: {src.collection}</span>
                                <span className="text-stone-400">Indexed {src.dateFound}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                    </div>

                  </div>
                );
              })
            )}
          </div>

          {/* Right Thematic Insight Sidebar */}
          <ThematicInsightSidebar
            insights={thematicInsights}
            activeThemeId={activeThemeId}
            onSelectTheme={(themeId) => {
              setActiveThemeId(themeId);
              if (!themeId) {
                setActiveThemeName(null);
                setThemeFilterFactIds(null);
              }
            }}
            onFilterByFactIds={(ids, name) => {
              setThemeFilterFactIds(ids);
              setActiveThemeName(name);
            }}
            onDraftChapterFromTheme={onDraftChapterFromTheme}
            isOpen={isThematicSidebarOpen}
            onToggleOpen={() => setIsThematicSidebarOpen(!isThematicSidebarOpen)}
            recentSearches={recentSearches}
            onFilterTimelineByKeyword={(keyword) => {
              setSearchQuery(keyword);
              if (researchViewMode !== 'chronology') {
                setResearchViewMode('chronology');
              }
            }}
            onInsertExplanationToDraft={onInsertExplanationToDraft}
          />

        </div>

      </div>
    )}
    </>
  )}


      {/* MODAL 2: GEDCOM IMPORT / ANCESTRY SYNC */}
      {showGedcomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white max-w-lg w-full rounded-xl shadow-2xl border border-stone-300 p-6 text-stone-900 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-md bg-[#1D7044] text-white font-bold flex items-center justify-center font-serif-book">
                  A
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-base">Import Ancestry.com GEDCOM (.ged)</h3>
                  <p className="text-xs text-stone-500">Universal family tree standard from Ancestry or FamilySearch</p>
                </div>
              </div>
              <button onClick={() => setShowGedcomModal(false)} className="text-stone-400 hover:text-stone-700">
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs text-stone-700">
              <p>
                Ancestry allows users to export their family tree as a standard <strong>.GED</strong> file (GEDCOM format). Upload grandfather's tree file here to instantly parse all relatives, censuses, and birth certificates into KinScribe!
              </p>

              {/* Upload Zone */}
              <div 
                className="border-2 border-dashed border-stone-300 hover:border-emerald-500 rounded-xl p-6 text-center cursor-pointer bg-stone-50 transition-colors"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = '.ged,.gedcom';
                  input.onchange = (e: any) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const content = event.target?.result as string;
                        onImportGedcomTree(content, file.name);
                        setShowGedcomModal(false);
                      };
                      reader.readAsText(file);
                    }
                  };
                  input.click();
                }}
              >
                <Upload className="w-8 h-8 text-emerald-700 mx-auto mb-2" />
                <p className="font-semibold text-stone-800 text-sm">Click to Select .GED File from Computer</p>
                <p className="text-xs text-stone-500 mt-1">Supports standard GEDCOM 5.5 and 5.5.1 files exported from Ancestry.com</p>
              </div>

              {/* Quick Sample Button for testing */}
              <div className="p-3 bg-stone-100 rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-medium text-stone-800">Don't have a file ready?</p>
                  <p className="text-[11px] text-stone-500">Test with Ward Scott's sample Fitts Village GEDCOM export</p>
                </div>
                <button
                  onClick={() => {
                    const sampleText = generateSampleGedcomText();
                    onImportGedcomTree(sampleText, 'scott_fitts_village_export.ged');
                    setShowGedcomModal(false);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold bg-[#1D7044] text-white rounded-lg shadow-xs hover:bg-[#165634] transition-colors"
                >
                  Load Sample Tree
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowGedcomModal(false)}
                className="px-4 py-2 text-xs text-stone-600 hover:bg-stone-100 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: LIVE CROSS-SITE SEARCH ASSISTANT */}
      {showLiveSearchAssistant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white max-w-lg w-full rounded-xl shadow-2xl border border-stone-300 p-6 text-stone-900 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-amber-700" />
                <h3 className="font-bold text-stone-900 text-base">Cross-Site Search Assistant</h3>
              </div>
              <button onClick={() => setShowLiveSearchAssistant(false)} className="text-stone-400 hover:text-stone-700">
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-600">
              Type any ancestor's details to automatically generate live search queries on both <strong>FamilySearch.org</strong> and <strong>Ancestry.com</strong> simultaneously:
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-stone-600 font-medium mb-1">First & Middle Name</label>
                <input
                  type="text"
                  defaultValue={selectedAncestor?.name?.split(' ')[0] || ''}
                  id="search_assistant_fname"
                  className="w-full p-2 border border-stone-300 rounded-lg bg-stone-50"
                />
              </div>
              <div>
                <label className="block text-stone-600 font-medium mb-1">Last / Surname</label>
                <input
                  type="text"
                  defaultValue={selectedAncestor?.name?.split(' ').slice(-1)[0] || ''}
                  id="search_assistant_lname"
                  className="w-full p-2 border border-stone-300 rounded-lg bg-stone-50"
                />
              </div>
              <div>
                <label className="block text-stone-600 font-medium mb-1">Birth Year (Approx)</label>
                <input
                  type="number"
                  defaultValue={selectedAncestor?.birthYear || 1888}
                  id="search_assistant_year"
                  className="w-full p-2 border border-stone-300 rounded-lg bg-stone-50"
                />
              </div>
              <div>
                <label className="block text-stone-600 font-medium mb-1">Birth Location</label>
                <input
                  type="text"
                  defaultValue={selectedAncestor?.birthPlace || 'Fitts Village, St. James, Barbados'}
                  id="search_assistant_place"
                  className="w-full p-2 border border-stone-300 rounded-lg bg-stone-50"
                />
              </div>
            </div>

            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => {
                  const fname = (document.getElementById('search_assistant_fname') as HTMLInputElement)?.value || '';
                  const lname = (document.getElementById('search_assistant_lname') as HTMLInputElement)?.value || '';
                  const year = parseInt((document.getElementById('search_assistant_year') as HTMLInputElement)?.value || '1900', 10);
                  const place = (document.getElementById('search_assistant_place') as HTMLInputElement)?.value || '';
                  const url = buildFamilySearchRecordUrl(fname, lname, year, place);
                  window.open(url, '_blank', 'noopener,noreferrer');
                }}
                className="p-3 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-lg text-left text-xs transition-colors"
              >
                <div className="flex items-center justify-between text-[#0076CE] font-bold">
                  <span>Open FamilySearch.org</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
                <p className="text-stone-500 mt-1">Runs instant query in FamilySearch historical archives</p>
              </button>

              <button
                onClick={() => {
                  const fname = (document.getElementById('search_assistant_fname') as HTMLInputElement)?.value || '';
                  const lname = (document.getElementById('search_assistant_lname') as HTMLInputElement)?.value || '';
                  const year = parseInt((document.getElementById('search_assistant_year') as HTMLInputElement)?.value || '1900', 10);
                  const place = (document.getElementById('search_assistant_place') as HTMLInputElement)?.value || '';
                  const url = buildAncestryRecordUrl(fname, lname, year, place);
                  window.open(url, '_blank', 'noopener,noreferrer');
                }}
                className="p-3 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-lg text-left text-xs transition-colors"
              >
                <div className="flex items-center justify-between text-[#1D7044] font-bold">
                  <span>Open Ancestry.com</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
                <p className="text-stone-500 mt-1">Runs instant query in Ancestry censuses and member trees</p>
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowLiveSearchAssistant(false)}
                className="px-4 py-2 text-xs text-stone-600 hover:bg-stone-100 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ANCESTOR PROFILE DOSSIER MODAL */}
      <AncestorProfileModal
        ancestor={profileAncestor}
        facts={facts}
        isOpen={profileAncestor !== null}
        onClose={() => setProfileAncestor(null)}
        onCiteFact={(fact) => {
          const src = fact.sources[0];
          onInsertCitationToBook(fact, src);
        }}
        onOpenMapModal={onOpenMapModal}
        onOpenJourneyMap={() => setResearchViewMode('journey')}
      />

    </div>
  );
};
