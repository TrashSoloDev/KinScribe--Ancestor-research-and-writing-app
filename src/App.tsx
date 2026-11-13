import React, { lazy, Suspense, useState, useEffect, useRef, useLayoutEffect } from 'react';
import { 
  Ancestor, 
  TimelineFact, 
  RecordSource, 
  ManuscriptChapter, 
  CitationFootnote, 
  RecordConflict,
  ConflictingRecordOption,
  HistoricalSearchQuery,
  RecentArchivalFact
} from './types/genealogy';
import { 
  INITIAL_ANCESTORS, 
  RAW_HISTORICAL_FACTS, 
  INITIAL_CHAPTERS 
} from './data/seedAncestors';
import { INITIAL_CONFLICTS } from './data/seedConflicts';
import { INITIAL_RECENT_SEARCHES } from './data/seedRecentSearches';
import { SCRAPBOOK_STORAGE_KEY } from './data/scrapbookData';
import { deduplicateTimelineFacts } from './utils/deduplication';
import { parseGedcom } from './utils/gedcomParser';
import { SeniorAccessibilityBar } from './components/SeniorAccessibilityBar';
import { AndroidBottomNav } from './components/AndroidBottomNav';
import { 
  BookOpen, 
  Search, 
  Check, 
  Bookmark, 
  Sparkles, 
  ArrowLeftRight,
  ShieldCheck,
  History,
  Smartphone,
  Tablet,
  Monitor,
  Share2,
  Mic,
  Compass,
  Camera
} from 'lucide-react';

import { parseUploadedManuscriptFile, ImportedManuscript } from './utils/manuscriptImporter';

const DocumentWriterTab = lazy(() => import('./components/DocumentWriterTab').then(module => ({ default: module.DocumentWriterTab })));
const ResearchTab = lazy(() => import('./components/ResearchTab').then(module => ({ default: module.ResearchTab })));
const OralHistoryRecorderModal = lazy(() => import('./components/OralHistoryRecorderModal').then(module => ({ default: module.OralHistoryRecorderModal })));
const FittsVillageMapModal = lazy(() => import('./components/FittsVillageMapModal').then(module => ({ default: module.FittsVillageMapModal })));
const AmazonKDPExportModal = lazy(() => import('./components/AmazonKDPExportModal').then(module => ({ default: module.AmazonKDPExportModal })));
const ScrapbookGalleryModal = lazy(() => import('./components/ScrapbookGalleryModal').then(module => ({ default: module.ScrapbookGalleryModal })));
const GuidedTutorialModal = lazy(() => import('./components/GuidedTutorialModal').then(module => ({ default: module.GuidedTutorialModal })));

const STORAGE_KEY = 'kinscribe_fitts_village_genealogy_v4';
const INTRO_COMPLETED_KEY = 'kinscribe_guided_introduction_completed_v1';

export default function App() {
  // Navigation: active tab ('writer' | 'research')
  const [activeTab, setActiveTab] = useState<'writer' | 'research'>('writer');

  // Device mode state (Responsive full-screen by default)
  const [deviceMode, setDeviceMode] = useState<'responsive' | 'android-phone' | 'android-tablet'>('responsive');
  const [searchAssistantTrigger, setSearchAssistantTrigger] = useState<number>(0);

  // Companion Modals State
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [showKDPModal, setShowKDPModal] = useState(false);
  const [showScrapbookModal, setShowScrapbookModal] = useState(false);
  const [showTutorialModal, setShowTutorialModal] = useState(() => {
    try {
      return localStorage.getItem(INTRO_COMPLETED_KEY) !== 'true';
    } catch (error) {
      console.warn('Could not read guided introduction status', error);
      return false;
    }
  });

  const closeGuidedIntroduction = () => {
    setShowTutorialModal(false);
    try {
      localStorage.setItem(INTRO_COMPLETED_KEY, 'true');
    } catch (error) {
      console.warn('Could not save guided introduction status', error);
    }
  };


  // Senior accessibility text scale
  const [fontSizeScale, setFontSizeScale] = useState<'standard' | 'large' | 'xlarge'>('large');

  // Google Maps Platform Quota Exceeded banner state
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  useEffect(() => {
    const handleQuota = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuota);
  }, []);

  // Scroll position memory state for all tabs
  const scrollPositions = useRef<{ writer: number; research: number }>({
    writer: 0,
    research: 0
  });
  const [scrollToast, setScrollToast] = useState<string | null>(null);

  // Core Data States
  const [documentTitle, setDocumentTitle] = useState('Echoes of Fitts Village: An Ancestral Genealogy (Ward Scott)');
  const [ancestors, setAncestors] = useState<Ancestor[]>(INITIAL_ANCESTORS);
  const [rawFacts, setRawFacts] = useState<TimelineFact[]>(RAW_HISTORICAL_FACTS);
  const [selectedAncestorId, setSelectedAncestorId] = useState<string>('indi_ancil_scott');
  const [chapters, setChapters] = useState<ManuscriptChapter[]>(INITIAL_CHAPTERS);
  const [activeChapterId, setActiveChapterId] = useState<string>('ch_1');
  const [lastSavedText, setLastSavedText] = useState('Saved to device');
  const [conflicts, setConflicts] = useState<RecordConflict[]>(INITIAL_CONFLICTS);
  const [recentSearches, setRecentSearches] = useState<HistoricalSearchQuery[]>(INITIAL_RECENT_SEARCHES);

  // Starred Important Discoveries (User-flagged facts for priority writing)
  const [starredFactIds, setStarredFactIds] = useState<string[]>([
    'anc_samuel_land',
    'fs_ancil_birth',
    'anc_ancil_boatbuilding'
  ]);

  // Initial Citations linking to historical sources in Barbados & Caribbean archives
  const [citations, setCitations] = useState<CitationFootnote[]>([
    {
      id: 'cite_1',
      number: 1,
      factId: 'fs_samuel_birth',
      ancestorName: 'Samuel Thomas Scott',
      eventTitle: 'Parish Registry Baptism',
      year: 1852,
      shortCitation: 'St. James Parish Register (1852)',
      fullCitation: 'FamilySearch.org: Barbados Church Records, 1637-1887, St. James Parish Church, Holetown, Barbados; Vol 14, p. 204.',
      sourceUrl: 'https://www.familysearch.org/search/collection/1920801',
      provider: 'familysearch'
    },
    {
      id: 'cite_2',
      number: 2,
      factId: 'anc_samuel_land',
      ancestorName: 'Samuel Thomas Scott',
      eventTitle: 'Fitts Village Freehold Land Deed',
      year: 1898,
      shortCitation: 'Barbados Registry of Deeds (1898)',
      fullCitation: 'Ancestry.com: Barbados Land Deeds and Conveyance Rolls, 1850-1920; Registrar of Titles, Vol 1898-C, p. 312.',
      sourceUrl: 'https://www.ancestry.com/search/collections/60275/',
      provider: 'ancestry'
    },
    {
      id: 'cite_3',
      number: 3,
      factId: 'fs_joseph_birth',
      ancestorName: 'Joseph Nathaniel Scott',
      eventTitle: 'Baptismal Registry of St. James',
      year: 1885,
      shortCitation: 'St. James Baptisms, Vol 28 (1885)',
      fullCitation: 'Compiled from FamilySearch & Ancestry: Barbados Church Records, 1637-1887; Joseph Nathaniel Scott, St. James, Barbados.',
      sourceUrl: 'https://www.familysearch.org/search/collection/1920801',
      provider: 'familysearch'
    },
    {
      id: 'cite_4',
      number: 4,
      factId: 'fs_joseph_marriage',
      ancestorName: 'Joseph & Sarah Scott',
      eventTitle: 'Marriage at St. James Church',
      year: 1915,
      shortCitation: 'St. James Parish Church Registers (1915)',
      fullCitation: 'FamilySearch.org: Barbados Church Records - Marriages 1854-1925; St. James Parish, Holetown; Record #STJ-1915-42.',
      sourceUrl: 'https://www.familysearch.org/search/collection/1920801',
      provider: 'familysearch'
    },
    {
      id: 'cite_5',
      number: 5,
      factId: 'fs_ancil_1921_census',
      ancestorName: 'Joseph Scott & Ancil Scott',
      eventTitle: '1921 Barbados Population Schedule',
      year: 1921,
      shortCitation: '1921 Census of Barbados, District E',
      fullCitation: 'Deduplicated Proof (FamilySearch & Ancestry): Barbados Government Gazette Population Schedule 1921, Fitts Village coastal tract, ED-4.',
      sourceUrl: 'https://www.familysearch.org/search/collection/1920801',
      provider: 'familysearch'
    },
    {
      id: 'cite_6',
      number: 6,
      factId: 'fs_ancil_birth',
      ancestorName: 'Ancil Chesterfield Scott',
      eventTitle: 'Civil Registration of Birth',
      year: 1918,
      shortCitation: 'St. James Civil Registry #1409 (1918)',
      fullCitation: 'FamilySearch & Ancestry: Barbados Civil Registration 1900-1931; Department of Archives (Black Rock, St. Michael); Certificate #1409.',
      sourceUrl: 'https://www.familysearch.org/search/collection/1920801',
      provider: 'familysearch'
    },
    {
      id: 'cite_7',
      number: 7,
      factId: 'anc_ancil_boatbuilding',
      ancestorName: 'Ancil Chesterfield Scott',
      eventTitle: 'Barbados Marine Board Boatbuilding Registry',
      year: 1938,
      shortCitation: 'Barbados Marine Board License #BMB-38 (1938)',
      fullCitation: 'Ancestry.com: Barbados & West Indies Maritime Licenses & Port Registers, 1880-1950; Marine Board Registry #BMB-38-092.',
      sourceUrl: 'https://www.ancestry.com/search/collections/60275/',
      provider: 'ancestry'
    },
    {
      id: 'cite_8',
      number: 8,
      factId: 'fs_ancil_marriage',
      ancestorName: 'Ancil & Evelyn Scott',
      eventTitle: 'Marriage at St. James Parish Church',
      year: 1941,
      shortCitation: 'St. James Marriage Register (1941)',
      fullCitation: 'Compiled from FamilySearch & Ancestry: Barbados Marriages, 1854-1945; St. James Parish Registers, Record STJ-1941-MARR-88.',
      sourceUrl: 'https://www.familysearch.org/search/collection/1920801',
      provider: 'familysearch'
    },
    {
      id: 'cite_9',
      number: 9,
      factId: 'anc_ancil_passenger_1955',
      ancestorName: 'Ancil Chesterfield Scott',
      eventTitle: 'SS Colombie Passenger Voyage',
      year: 1955,
      shortCitation: 'SS Colombie Passenger Manifest, UK (1955)',
      fullCitation: 'Ancestry.com: UK and Ireland, Incoming Passenger Lists, 1878-1960; French Line SS Colombie arriving Southampton June 1955; BT26/1332.',
      sourceUrl: 'https://www.ancestry.com/search/collections/1518/',
      provider: 'ancestry'
    }
  ]);

  // Most recently added/researched archival fact or note
  const [recentArchivalFact, setRecentArchivalFact] = useState<RecentArchivalFact | null>({
    id: 'fs_samuel_land_freehold',
    sourceType: 'research',
    title: 'Samuel Scott: Coastal Land Freehold (1898)',
    snippet: 'Barbados Department of Archives: Samuel Scott purchased and recorded coastal freehold parcel in Fitts Village, St. James (Deed Roll #88-B, Folio 14).',
    fullText: 'As documented in FamilySearch records & Barbados Department of Archives, in 1898, Samuel Scott purchased and recorded a coastal freehold parcel in Fitts Village, St. James Parish, establishing permanent roots for the Scott family along the West Coast.',
    sourceCitation: 'Barbados Department of Archives (Black Rock, St. Michael); Deed Roll #88-B, Folio 14.',
    timestamp: Date.now() - 1000 * 60 * 15,
    domElementId: undefined
  });

  // Calculate compiled & deduplicated facts!
  const compiledFacts = React.useMemo(() => {
    return deduplicateTimelineFacts(rawFacts);
  }, [rawFacts]);

  // Load from localStorage on mount if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.documentTitle) setDocumentTitle(parsed.documentTitle);
        if (parsed.selectedAncestorId) setSelectedAncestorId(parsed.selectedAncestorId);
        if (parsed.activeChapterId) setActiveChapterId(parsed.activeChapterId);
        if (parsed.chapters && parsed.chapters.length > 0) setChapters(parsed.chapters);
        if (parsed.citations) setCitations(parsed.citations);
        if (parsed.ancestors) setAncestors(parsed.ancestors);
        if (parsed.rawFacts) setRawFacts(parsed.rawFacts);
        if (parsed.starredFactIds && Array.isArray(parsed.starredFactIds)) {
          setStarredFactIds(parsed.starredFactIds);
        }
        if (parsed.conflicts && Array.isArray(parsed.conflicts)) {
          setConflicts(parsed.conflicts);
        }
        if (parsed.recentSearches && Array.isArray(parsed.recentSearches)) {
          setRecentSearches(parsed.recentSearches);
        }
        if (parsed.recentArchivalFact) {
          setRecentArchivalFact(parsed.recentArchivalFact);
        }
      }
    } catch (e) {
      console.warn('Could not read saved data from localStorage', e);
    }
  }, []);

  // Save to localStorage on changes with debounced visual feedback & timestamp
  const saveTimeoutRef = useRef<any>(null);
  useEffect(() => {
    setLastSavedText('Saving...');
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(() => {
      try {
        const payload = {
          documentTitle,
          selectedAncestorId,
          activeChapterId,
          chapters,
          citations,
          ancestors,
          rawFacts,
          starredFactIds,
          conflicts,
          recentSearches,
          recentArchivalFact
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setLastSavedText(`Saved at ${timeStr}`);
      } catch (e) {
        console.warn('Could not auto-save to localStorage', e);
        setLastSavedText('Offline save error');
      }
    }, 450);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [documentTitle, selectedAncestorId, activeChapterId, chapters, citations, ancestors, rawFacts, starredFactIds, conflicts, recentSearches, recentArchivalFact]);

  const handleCreateBackup = () => {
    try {
      const scrapbookItems = JSON.parse(localStorage.getItem(SCRAPBOOK_STORAGE_KEY) || '[]');
      const backup = {
        format: 'kinscribe-backup',
        version: 1,
        createdAt: new Date().toISOString(),
        appData: {
          documentTitle,
          selectedAncestorId,
          activeChapterId,
          chapters,
          citations,
          ancestors,
          rawFacts,
          starredFactIds,
          conflicts,
          recentSearches,
          recentArchivalFact
        },
        scrapbookItems
      };
      const file = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = url;
      link.download = `KinScribe-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setScrollToast('Family history backup downloaded. Keep it somewhere safe.');
      setTimeout(() => setScrollToast(null), 4000);
    } catch (error) {
      console.error('Backup export failed', error);
      alert('KinScribe could not create the backup. Check available device storage and try again.');
    }
  };

  const handleRestoreBackup = async (file: File) => {
    try {
      if (file.size > 100 * 1024 * 1024) {
        throw new Error('This backup file is larger than 100 MB.');
      }
      const backup = JSON.parse(await file.text());
      const appData = backup?.appData;
      if (
        backup?.format !== 'kinscribe-backup' ||
        backup?.version !== 1 ||
        !appData ||
        typeof appData.documentTitle !== 'string' ||
        !Array.isArray(appData.chapters) ||
        !Array.isArray(appData.citations) ||
        !Array.isArray(appData.ancestors) ||
        !Array.isArray(appData.rawFacts) ||
        !Array.isArray(backup.scrapbookItems) ||
        !backup.scrapbookItems.every((item: unknown) => {
          if (!item || typeof item !== 'object') return false;
          const scrapbookItem = item as Record<string, unknown>;
          return typeof scrapbookItem.id === 'string' &&
            typeof scrapbookItem.title === 'string' &&
            typeof scrapbookItem.imageUrl === 'string';
        })
      ) {
        throw new Error('This is not a supported KinScribe backup file.');
      }

      if (!window.confirm('Restoring replaces the saved work on this device. Continue?')) return;

      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      const previousAppData = localStorage.getItem(STORAGE_KEY);
      const previousScrapbookItems = localStorage.getItem(SCRAPBOOK_STORAGE_KEY);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
        localStorage.setItem(SCRAPBOOK_STORAGE_KEY, JSON.stringify(backup.scrapbookItems));
      } catch (error) {
        if (previousAppData === null) localStorage.removeItem(STORAGE_KEY);
        else localStorage.setItem(STORAGE_KEY, previousAppData);
        if (previousScrapbookItems === null) localStorage.removeItem(SCRAPBOOK_STORAGE_KEY);
        else localStorage.setItem(SCRAPBOOK_STORAGE_KEY, previousScrapbookItems);
        throw error;
      }

      window.location.reload();
    } catch (error) {
      console.error('Backup restore failed', error);
      const message = error instanceof Error ? error.message : 'The backup could not be restored.';
      alert(`${message} Your saved work was not replaced.`);
    }
  };

  // Toggle Star Fact Handler (flag/unflag important discoveries)
  const handleToggleStarFact = (factId: string) => {
    setStarredFactIds(prev => {
      const isStarred = prev.includes(factId);
      const next = isStarred ? prev.filter(id => id !== factId) : [...prev, factId];
      setScrollToast(isStarred ? 'Fact unstarred' : '⭐ Starred as Key Discovery!');
      setTimeout(() => setScrollToast(null), 2500);
      return next;
    });
  };

  // SCROLL MEMORY LOGIC:
  // When switching tabs, capture the outgoing tab's scroll position,
  // switch tabs, then restore the incoming tab's saved scroll position!
  const handleTabSwitch = (newTab: 'writer' | 'research') => {
    if (newTab === activeTab) return;

    // 1. Capture current scroll position
    const currentScroll = window.scrollY || document.documentElement.scrollTop || 0;
    scrollPositions.current[activeTab] = currentScroll;

    // 2. Switch tab
    setActiveTab(newTab);

    // 3. Prepare user notification
    const destName = newTab === 'writer' ? 'My Manuscript Book' : 'Genealogy Research';
    setScrollToast(`Switched to ${destName}`);
    setTimeout(() => setScrollToast(null), 3000);
  };

  // Restore scroll position after DOM paints
  useLayoutEffect(() => {
    const targetScroll = scrollPositions.current[activeTab] || 0;
    // Delay slightly to allow layout reflow
    const timer = setTimeout(() => {
      window.scrollTo({
        top: targetScroll,
        behavior: 'instant' as any
      });
    }, 40);

    return () => clearTimeout(timer);
  }, [activeTab]);

  // Insert verified fact & citation into book
  const handleInsertCitationToBook = (fact: TimelineFact, source: RecordSource) => {
    const nextNum = citations.length + 1;
    const anc = ancestors.find(a => a.id === fact.ancestorId);
    const elementId = `archival-cite-${Date.now()}`;
    
    const newCitation: CitationFootnote = {
      id: `cite_${Date.now()}`,
      number: nextNum,
      factId: fact.id,
      ancestorName: anc?.name || 'Ancestor',
      eventTitle: fact.title,
      year: fact.year,
      shortCitation: `${fact.title} (${fact.year})`,
      fullCitation: source.citationText,
      sourceUrl: source.externalUrl,
      provider: source.provider
    };

    setCitations(prev => [...prev, newCitation]);

    // Update most recent archival fact for 1-click Recall & Spotlight
    setRecentArchivalFact({
      id: fact.id,
      sourceType: 'research',
      title: `${anc?.name || 'Ancestor'}: ${fact.title} (${fact.year})`,
      snippet: fact.description,
      fullText: `As documented in ${source.provider === 'familysearch' ? 'FamilySearch records' : 'Ancestry.com historical archives'}, on ${fact.dateStr}, ${fact.description} [${nextNum}].`,
      sourceCitation: `${source.citationText} (${source.externalUrl})`,
      timestamp: Date.now(),
      domElementId: elementId
    });

    // Also append sentence to the currently active chapter
    setChapters(prev => prev.map(ch => {
      if (ch.id === activeChapterId) {
        const sentence = `<p id="${elementId}" data-archival-fact-id="${fact.id}" class="archival-fact-item my-2 transition-all duration-300">As documented in ${source.provider === 'familysearch' ? 'FamilySearch records' : 'Ancestry.com historical archives'}, on ${fact.dateStr}, ${fact.description} <sup class="text-amber-800 font-bold">[${nextNum}]</sup>.</p>`;
        const updatedHtml = ch.contentHtml + '\n' + sentence;
        const words = (ch.wordCount || 0) + 20;
        return {
          ...ch,
          contentHtml: updatedHtml,
          wordCount: words,
          updatedAt: Date.now()
        };
      }
      return ch;
    }));
    setScrollToast(`Archival record "${fact.title}" cited in book! Click "Recall" in Writer anytime to highlight it.`);
    setTimeout(() => setScrollToast(null), 3500);
  };

  // Chapter handlers
  const handleUpdateChapterContent = (chapterId: string, newHtml: string, words: number) => {
    setChapters(prev => prev.map(c => 
      c.id === chapterId ? { ...c, contentHtml: newHtml, wordCount: words, updatedAt: Date.now() } : c
    ));
  };

  const handleAddChapter = () => {
    const newIdx = chapters.length + 1;
    const newChapter: ManuscriptChapter = {
      id: `ch_${Date.now()}`,
      title: `Chapter ${newIdx}: New Family Reflections`,
      subtitle: 'Notes and genealogy records',
      contentHtml: `<h2>A New Chapter Begins</h2><p>Record your grandfather's memories and family history discoveries here...</p>`,
      wordCount: 16,
      updatedAt: Date.now()
    };
    setChapters(prev => [...prev, newChapter]);
    setActiveChapterId(newChapter.id);
  };

  const handleDeleteChapter = (chapterId: string) => {
    if (chapters.length <= 1) return;
    const filtered = chapters.filter(c => c.id !== chapterId);
    setChapters(filtered);
    if (activeChapterId === chapterId) {
      setActiveChapterId(filtered[0].id);
    }
  };

  // Create a new chapter seeded from an automated Thematic Insight
  const handleDraftChapterFromTheme = (chapterTitle: string, promptSummary: string) => {
    const newIdx = chapters.length + 1;
    const cleanTitle = `Chapter ${newIdx}: ${chapterTitle}`;
    const newChapter: ManuscriptChapter = {
      id: `ch_${Date.now()}`,
      title: cleanTitle,
      subtitle: `Key Theme Exploration · ${ancestors.find(a => a.id === selectedAncestorId)?.name || 'Family Heritage'}`,
      contentHtml: `<h2>${chapterTitle}</h2><p><em>Historical Context: ${promptSummary}</em></p><p>As we trace the archival records preserved across generations...</p>`,
      wordCount: 22,
      updatedAt: Date.now()
    };
    setChapters(prev => [...prev, newChapter]);
    setActiveChapterId(newChapter.id);
    setActiveTab('writer');
    setScrollToast(`Created new chapter "${cleanTitle}" from Thematic Insight!`);
    setTimeout(() => setScrollToast(null), 3500);
  };

  // GEDCOM Import handler
  const handleImportGedcomTree = (gedcomText: string, filename: string) => {
    try {
      const parsed = parseGedcom(gedcomText, 'ancestry');
      if (parsed.ancestors.length > 0) {
        // Merge or replace ancestors
        setAncestors(parsed.ancestors);
        setRawFacts(parsed.facts);
        setSelectedAncestorId(parsed.ancestors[0].id);
        
        setScrollToast(`Successfully imported ${parsed.ancestors.length} ancestors and ${parsed.facts.length} records from ${filename}!`);
        setTimeout(() => setScrollToast(null), 4000);
      }
    } catch (e) {
      console.error('Error importing GEDCOM', e);
      alert('Could not parse GEDCOM file. Please check file formatting.');
    }
  };

  // Companion Insertion Handlers
  const handleInsertVoiceText = (text: string) => {
    const p = `<p>${text}</p>`;
    setChapters(prev => prev.map(ch => {
      if (ch.id === activeChapterId) {
        return {
          ...ch,
          contentHtml: ch.contentHtml + '\n' + p,
          wordCount: (ch.wordCount || 0) + text.trim().split(/\s+/).length,
          updatedAt: Date.now()
        };
      }
      return ch;
    }));
    setScrollToast('Voice memory inserted into active chapter!');
    setTimeout(() => setScrollToast(null), 3000);
  };

  const handleInsertMapExcerpt = (excerptHtml: string) => {
    setChapters(prev => prev.map(ch => {
      if (ch.id === activeChapterId) {
        return {
          ...ch,
          contentHtml: ch.contentHtml + '\n' + excerptHtml,
          wordCount: (ch.wordCount || 0) + 25,
          updatedAt: Date.now()
        };
      }
      return ch;
    }));
    setScrollToast('Landmark historical note inserted into chapter!');
    setTimeout(() => setScrollToast(null), 3000);
  };

  const handleInsertScrapbookFigure = (figureHtml: string) => {
    setChapters(prev => prev.map(ch => {
      if (ch.id === activeChapterId) {
        return {
          ...ch,
          contentHtml: ch.contentHtml + '\n' + figureHtml,
          updatedAt: Date.now()
        };
      }
      return ch;
    }));
    setScrollToast('Archival photo attached to chapter!');
    setTimeout(() => setScrollToast(null), 3000);
  };

  // Import Existing Manuscript handler (preserves formatting & layout from Word .docx, HTML, Markdown, or text)
  const handleImportManuscript = (imported: ImportedManuscript) => {
    if (imported.chapters && imported.chapters.length > 0) {
      setChapters(imported.chapters);
      setActiveChapterId(imported.chapters[0].id);
      if (imported.title && imported.title !== 'Untitled Chapter') {
        setDocumentTitle(imported.title);
      }
      setScrollToast(`Imported "${imported.title}" (${imported.chapters.length} chapter${imported.chapters.length > 1 ? 's' : ''}, ${imported.totalWordCount.toLocaleString()} words) with layout preserved!`);
      setTimeout(() => setScrollToast(null), 4500);
    }
  };

  // Conflict Resolution: Primary Record Selection Handler
  const handleSelectPrimaryRecord = (conflictId: string, primaryChoice: 'recordA' | 'recordB', notes?: string) => {
    const conflictObj = conflicts.find(c => c.id === conflictId);
    if (!conflictObj) return;

    const chosenRecord: ConflictingRecordOption = primaryChoice === 'recordA' ? conflictObj.recordA : conflictObj.recordB;

    setConflicts(prev => prev.map(c => {
      if (c.id === conflictId) {
        return {
          ...c,
          selectedPrimaryId: primaryChoice,
          status: 'resolved',
          resolutionNotes: notes !== undefined ? notes : c.resolutionNotes,
          resolvedAt: new Date().toLocaleDateString()
        };
      }
      return c;
    }));

    const sourceName = chosenRecord.provider === 'familysearch' ? 'FamilySearch' : 'Ancestry.com';

    // Synchronize rawFacts so that the primary timeline view, horizontal chart, and dossier reflect the selected authoritative record!
    setRawFacts(prev => prev.map(f => {
      // 1. Birth record conflict
      if (conflictObj?.discrepancyType === 'date' && f.ancestorId === conflictObj.ancestorId && f.eventType === 'birth') {
        return {
          ...f,
          year: chosenRecord!.year,
          dateStr: chosenRecord!.dateStr,
          place: chosenRecord!.place || f.place,
          description: chosenRecord!.description || f.description,
          notes: `[Primary Resolved from ${sourceName}]: ${chosenRecord!.citation}`
        };
      }
      // 2. Marriage record conflict
      if (conflictObj?.fieldInConflict.toLowerCase().includes('marriage') && f.ancestorId === conflictObj.ancestorId && f.eventType === 'marriage') {
        return {
          ...f,
          year: chosenRecord!.year,
          dateStr: chosenRecord!.dateStr,
          place: chosenRecord!.place || f.place,
          notes: `[Primary Resolved from ${sourceName}]: ${chosenRecord!.citation}`
        };
      }
      // 3. Land / Freehold conflict
      if (conflictObj?.fieldInConflict.toLowerCase().includes('land') && f.ancestorId === conflictObj.ancestorId && (f.title.toLowerCase().includes('land') || f.title.toLowerCase().includes('freehold'))) {
        return {
          ...f,
          year: chosenRecord!.year,
          dateStr: chosenRecord!.dateStr,
          place: chosenRecord!.place || f.place,
          notes: `[Primary Resolved from ${sourceName}]: ${chosenRecord!.citation}`
        };
      }
      return f;
    }));

    setScrollToast(`✓ Selected ${sourceName} (${chosenRecord.dateStr}) as Primary Record for timeline!`);
    setTimeout(() => setScrollToast(null), 3500);
  };

  // Conflict Resolution: Cite Primary in Book Handler
  const handleCiteConflictRecord = (record: ConflictingRecordOption, ancestorName: string) => {
    const nextNum = citations.length + 1;
    const elementId = `archival-conflict-${Date.now()}`;
    const newCitation: CitationFootnote = {
      id: `cite_${Date.now()}`,
      number: nextNum,
      factId: record.rawFactId || `conflict_${record.id}`,
      ancestorName: ancestorName,
      eventTitle: record.sourceTitle,
      year: record.year,
      shortCitation: `${record.sourceTitle} (${record.year})`,
      fullCitation: record.citation,
      sourceUrl: record.externalUrl,
      provider: record.provider
    };

    setCitations(prev => [...prev, newCitation]);

    setRecentArchivalFact({
      id: record.id,
      sourceType: 'conflict',
      title: `${ancestorName}: ${record.sourceTitle} (${record.year})`,
      snippet: record.description,
      fullText: `As confirmed by primary archival evidence in ${record.provider === 'familysearch' ? 'FamilySearch.org' : 'Ancestry.com'} (${record.collection}), on ${record.dateStr}, ${record.description} [${nextNum}].`,
      sourceCitation: `${record.citation} (${record.externalUrl})`,
      timestamp: Date.now(),
      domElementId: elementId
    });

    setChapters(prev => prev.map(ch => {
      if (ch.id === activeChapterId) {
        const p = `<p id="${elementId}" data-archival-fact-id="${record.id}" class="archival-fact-item my-2 transition-all duration-300">As confirmed by primary archival evidence in ${record.provider === 'familysearch' ? 'FamilySearch.org' : 'Ancestry.com'} (${record.collection}), on ${record.dateStr}, ${record.description} <sup class="text-amber-800 font-bold">[${nextNum}]</sup>.</p>`;
        return {
          ...ch,
          contentHtml: ch.contentHtml + '\n' + p,
          wordCount: (ch.wordCount || 0) + 20,
          updatedAt: Date.now()
        };
      }
      return ch;
    }));

    setScrollToast(`Cited "${record.sourceTitle}" in active chapter!`);
    setTimeout(() => setScrollToast(null), 3000);
  };

  const handleInsertExplanationToDraft = (snippet: string) => {
    const elementId = `saved-research-${Date.now()}`;
    const blockHtml = `<blockquote id="${elementId}" data-archival-fact-id="${elementId}" class="historical-context-callout archival-fact-item p-3.5 my-3 bg-blue-50/70 border-l-4 border-blue-600 rounded-r-lg font-serif text-stone-800 text-sm leading-relaxed shadow-2xs transition-all duration-300"><strong>Historical Context Note:</strong> ${snippet}</blockquote><p><br/></p>`;
    
    setRecentArchivalFact({
      id: elementId,
      sourceType: 'research',
      title: 'Historical Context Discovery',
      snippet: snippet.length > 130 ? snippet.slice(0, 130) + '...' : snippet,
      fullText: snippet,
      sourceCitation: 'Saved historical research',
      timestamp: Date.now(),
      domElementId: elementId
    });

    setChapters(prev => prev.map(ch => {
      if (ch.id === activeChapterId) {
        return {
          ...ch,
          contentHtml: ch.contentHtml + '\n' + blockHtml,
          wordCount: (ch.wordCount || 0) + 25,
          updatedAt: Date.now()
        };
      }
      return ch;
    }));
    setScrollToast('Saved historical note inserted into active chapter!');
    setTimeout(() => setScrollToast(null), 3000);
  };

  // Native Android Share API
  const handleShare = async () => {
    const activeChap = chapters.find(c => c.id === activeChapterId);
    const shareData = {
      title: `${documentTitle} - ${activeChap?.title || 'Family History'}`,
      text: `Read my family history chapter on KinScribe: ${activeChap?.title || ''}`,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (e) {
        // user dismissed share dialog
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setScrollToast('Link copied to clipboard to share on Android!');
      setTimeout(() => setScrollToast(null), 3000);
    }
  };

  // Total book word count
  const totalBookWords = chapters.reduce((sum, c) => sum + (c.wordCount || 0), 0);

  // Core app content
  const renderAppContent = () => (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-950 text-stone-100">
      {quotaExceeded && (
        <div className="bg-amber-950/70 border-b border-amber-500/40 text-amber-100 px-4 py-3 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-200 hover:text-amber-100"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}
      {/* 1. MASTER UNIFIED TOP HEADER */}
      <SeniorAccessibilityBar
        activeTab={activeTab}
        onSelectTab={handleTabSwitch}
        documentTitle={documentTitle}
        onUpdateDocumentTitle={setDocumentTitle}
        fontSizeScale={fontSizeScale}
        setFontSizeScale={setFontSizeScale}
        wordCount={totalBookWords}
        chapterCount={chapters.length}
        citationCount={citations.length}
        lastSavedText={lastSavedText}
        deviceMode={deviceMode}
        onSelectDeviceMode={setDeviceMode}
        onOpenVoiceRecorder={() => setShowVoiceModal(true)}
        onOpenMapModal={() => setShowMapModal(true)}
        onOpenKDPModal={() => setShowKDPModal(true)}
        onOpenTutorial={() => setShowTutorialModal(true)}
        onCreateBackup={handleCreateBackup}
        onRestoreBackup={handleRestoreBackup}
        onShare={handleShare}
      />

      {/* FLOATING SCROLL MEMORY RESTORATION TOAST */}
      {scrollToast && (
        <div className="fixed bottom-16 md:bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-emerald-500/40 flex items-center gap-3 text-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Check className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{scrollToast}</span>
        </div>
      )}

      {/* 4. ACTIVE TAB VIEWPORT (with bottom padding for Android bottom navigation) */}
      <div key={activeTab} className="tab-view-enter flex-1 pb-20 md:pb-6">
        <Suspense fallback={<div className="p-6 text-center text-stone-300" role="status">Loading workspace...</div>}>
        {activeTab === 'writer' ? (
          <DocumentWriterTab
            chapters={chapters}
            activeChapterId={activeChapterId}
            onSelectChapter={setActiveChapterId}
            onUpdateChapterContent={handleUpdateChapterContent}
            onAddChapter={handleAddChapter}
            onDeleteChapter={handleDeleteChapter}
            citations={citations}
            conflicts={conflicts}
            allFacts={compiledFacts}
            ancestors={ancestors}
            fontSizeScale={fontSizeScale}
            documentTitle={documentTitle}
            onUpdateDocumentTitle={setDocumentTitle}
            onImportManuscript={handleImportManuscript}
            onOpenVoiceRecorder={() => setShowVoiceModal(true)}
            onOpenMapModal={() => setShowMapModal(true)}
            onOpenScrapbookModal={() => setShowScrapbookModal(true)}
            onOpenKDPModal={() => setShowKDPModal(true)}
            recentArchivalFact={recentArchivalFact}
            onUpdateRecentArchivalFact={setRecentArchivalFact}
          />
        ) : (
          <ResearchTab
            ancestors={ancestors}
            facts={compiledFacts}
            selectedAncestorId={selectedAncestorId}
            onSelectAncestor={setSelectedAncestorId}
            onInsertCitationToBook={handleInsertCitationToBook}
            onImportGedcomTree={handleImportGedcomTree}
            fontSizeScale={fontSizeScale}
            openSearchAssistantTrigger={searchAssistantTrigger}
            onOpenMapModal={() => setShowMapModal(true)}
            onOpenScrapbookModal={() => setShowScrapbookModal(true)}
            starredFactIds={starredFactIds}
            onToggleStarFact={handleToggleStarFact}
            onDraftChapterFromTheme={handleDraftChapterFromTheme}
            conflicts={conflicts}
            onSelectPrimaryRecord={handleSelectPrimaryRecord}
            onCiteConflictRecord={handleCiteConflictRecord}
            recentSearches={recentSearches}
            onInsertExplanationToDraft={handleInsertExplanationToDraft}
          />
        )}
        </Suspense>
      </div>

      {/* 5. ANDROID BOTTOM NAVIGATION BAR (Material 3 minimal dock) */}
      <AndroidBottomNav
        activeTab={activeTab}
        onSelectTab={handleTabSwitch}
        onOpenSearchAssistant={() => {
          setActiveTab('research');
          setSearchAssistantTrigger(Date.now());
        }}
        onOpenVoiceRecorder={() => setShowVoiceModal(true)}
        onShare={handleShare}
      />

      {/* 6. COMPANION MODALS FOR GRANDFATHER */}
      {showVoiceModal && <Suspense fallback={null}><OralHistoryRecorderModal
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        onInsertTranscription={handleInsertVoiceText}
        chapterTitle={chapters.find(c => c.id === activeChapterId)?.title || 'Current Chapter'}
      /></Suspense>}

      {showMapModal && <Suspense fallback={null}><FittsVillageMapModal
        isOpen={showMapModal}
        onClose={() => setShowMapModal(false)}
        onInsertExcerpt={handleInsertMapExcerpt}
      /></Suspense>}

      {showKDPModal && <Suspense fallback={null}><AmazonKDPExportModal
        isOpen={showKDPModal}
        onClose={() => setShowKDPModal(false)}
        documentTitle={documentTitle}
        chapters={chapters}
        citations={citations}
        ancestors={ancestors}
      /></Suspense>}

      {showScrapbookModal && <Suspense fallback={null}><ScrapbookGalleryModal
        isOpen={showScrapbookModal}
        onClose={() => setShowScrapbookModal(false)}
        onInsertImageToChapter={handleInsertScrapbookFigure}
      /></Suspense>}

      {showTutorialModal && <Suspense fallback={null}><GuidedTutorialModal
        isOpen={showTutorialModal}
        onClose={closeGuidedIntroduction}
        onSwitchTab={handleTabSwitch}
        activeTab={activeTab}
      /></Suspense>}
    </div>
  );


  return (
    <div className="min-h-screen bg-slate-950 text-stone-100 font-sans-ui flex flex-col items-center justify-start">
      {/* If Android Phone preview mode is active */}
      {deviceMode === 'android-phone' ? (
        <div className="w-full min-h-screen py-1 sm:py-6 flex flex-col items-center">
          <div className="hidden sm:flex text-xs text-stone-400 mb-2 items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-stone-300">Android App Preview (Google Pixel 8 Pro / Samsung Galaxy)</span>
            <button
              onClick={() => setDeviceMode('responsive')}
              className="text-amber-300 hover:underline ml-2"
            >
              Toggle Desktop View
            </button>
          </div>

          {/* Android Phone Mockup Frame */}
          <div className="w-full max-w-[430px] sm:h-[880px] h-screen bg-slate-950 sm:rounded-[48px] rounded-none sm:p-3 p-0 shadow-2xl sm:border-4 border-0 border-stone-700 relative flex flex-col overflow-hidden">
            {/* Top Phone Speaker & Camera Pinhole */}
            <div className="hidden sm:flex absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-stone-900 rounded-full z-50 items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-black border border-stone-800" />
            </div>

            {/* Android Status Bar */}
            <div className="bg-[#111827] text-stone-200 text-[11px] px-6 pt-3 pb-1 flex justify-between items-center shrink-0 font-medium z-40">
              <span className="font-bold">9:41</span>
              <div className="flex items-center gap-2 text-[10px]">
                <span className="font-semibold text-emerald-400">Android 14</span>
                <span>5G</span>
                <span>📶</span>
                <span>🔋 100%</span>
              </div>
            </div>

            {/* Android Screen Body */}
            <div className="flex-1 overflow-y-auto sm:rounded-b-[36px] rounded-none bg-slate-950 relative">
              {renderAppContent()}
            </div>
          </div>
        </div>
      ) : deviceMode === 'android-tablet' ? (
        <div className="w-full py-6 flex flex-col items-center">
          <div className="text-xs text-stone-400 mb-2 flex items-center gap-2">
            <Tablet className="w-4 h-4 text-emerald-400" />
            <span>Android Tablet Preview</span>
            <button
              onClick={() => setDeviceMode('responsive')}
              className="text-amber-300 hover:underline ml-2"
            >
              Exit to Full Screen
            </button>
          </div>

          {/* Android Tablet Frame */}
          <div className="w-full max-w-[820px] h-[920px] bg-slate-950 rounded-[36px] p-3 shadow-2xl border-4 border-stone-700 relative flex flex-col overflow-hidden">
            {/* Android Status Bar */}
            <div className="bg-[#111827] text-stone-200 text-xs px-6 pt-2 pb-1 flex justify-between items-center shrink-0 font-medium z-40">
              <span>9:41 AM · Wednesday, Nov 10</span>
              <div className="flex items-center gap-2 text-xs">
                <span>Wi-Fi</span>
                <span>🔋 100%</span>
              </div>
            </div>

            {/* Android Screen Body */}
            <div className="flex-1 overflow-y-auto rounded-b-[24px] bg-slate-950 relative">
              {renderAppContent()}
            </div>
          </div>
        </div>
      ) : (
        /* Standard Fullscreen / Native Mobile view */
        <div className="w-full min-h-screen bg-slate-950 text-stone-100">
          {renderAppContent()}
        </div>
      )}
    </div>
  );
}
