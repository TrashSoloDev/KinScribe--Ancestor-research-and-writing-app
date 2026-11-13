import React, { useState, useRef, useEffect } from 'react';
import { 
  ManuscriptChapter, 
  CitationFootnote, 
  TimelineFact,
  RecordSource,
  Ancestor,
  RecordConflict,
  RecentArchivalFact
} from '../types/genealogy';
import { 
  Undo, 
  Redo, 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify, 
  List, 
  ListOrdered, 
  Quote, 
  Minus, 
  Plus, 
  Printer, 
  Download, 
  BookMarked, 
  ExternalLink, 
  PlusCircle, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  FileText,
  Search,
  Check,
  Sparkles,
  Bookmark,
  ChevronUp,
  ChevronDown,
  X,
  ArrowDownUp,
  SlidersHorizontal,
  Mic,
  Compass,
  Camera,
  BookOpen,
  UploadCloud,
  FileUp,
  FileCode,
  FileType,
  FileDown,
  History,
  Copy
} from 'lucide-react';
import { parseUploadedManuscriptFile, ImportedManuscript } from '../utils/manuscriptImporter';
import { ChapterPdfExportModal } from './ChapterPdfExportModal';

interface Props {
  chapters: ManuscriptChapter[];
  activeChapterId: string;
  onSelectChapter: (id: string) => void;
  onUpdateChapterContent: (chapterId: string, newHtml: string, wordCount: number) => void;
  onAddChapter: () => void;
  onDeleteChapter: (chapterId: string) => void;
  citations: CitationFootnote[];
  conflicts?: RecordConflict[];
  allFacts: TimelineFact[];
  ancestors: Ancestor[];
  fontSizeScale: 'standard' | 'large' | 'xlarge';
  documentTitle: string;
  onUpdateDocumentTitle: (newTitle: string) => void;
  onImportManuscript?: (imported: ImportedManuscript) => void;
  onOpenVoiceRecorder?: () => void;
  onOpenMapModal?: () => void;
  onOpenScrapbookModal?: () => void;
  onOpenKDPModal?: () => void;
  recentArchivalFact?: RecentArchivalFact | null;
  onUpdateRecentArchivalFact?: (fact: RecentArchivalFact) => void;
}

export const DocumentWriterTab: React.FC<Props> = ({
  chapters,
  activeChapterId,
  onSelectChapter,
  onUpdateChapterContent,
  onAddChapter,
  onDeleteChapter,
  citations,
  conflicts = [],
  allFacts,
  ancestors,
  fontSizeScale,
  documentTitle,
  onUpdateDocumentTitle,
  onImportManuscript,
  onOpenVoiceRecorder,
  onOpenMapModal,
  onOpenScrapbookModal,
  onOpenKDPModal,
  recentArchivalFact,
  onUpdateRecentArchivalFact
}) => {

  const editorRef = useRef<HTMLDivElement>(null);
  const [showFactInserter, setShowFactInserter] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [editorFontFamily, setEditorFontFamily] = useState<'serif' | 'sans' | 'mono'>('serif');
  const [customFontSize, setCustomFontSize] = useState<number>(16);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [showChapterReview, setShowChapterReview] = useState(false);
  const [writingModeEnabled, setWritingModeEnabled] = useState(true);
  const [showPromptCards, setShowPromptCards] = useState(true);

  const WRITING_PROMPTS = [
    'Describe the morning the Scott family launched their boat from Fitts Village beach.',
    'What did a Sunday church morning in Holetown feel like for your grandfather and his elders?',
    'Tell the story of how the family made a living from the sea and from the land in St. James.',
    'What family sayings or customs did older relatives repeat when speaking about ancestry?'
  ];

  // Search & Replace State
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [showReplace, setShowReplace] = useState(false);
  const [matchCase, setMatchCase] = useState(false);
  const [searchScope, setSearchScope] = useState<'chapter' | 'all-chapters'>('chapter');
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [totalMatches, setTotalMatches] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // File Upload State & Dropzone
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Recall Archival Fact State
  const [showRecallFlyout, setShowRecallFlyout] = useState(false);
  const [recalledHighlightInfo, setRecalledHighlightInfo] = useState<{
    id: string;
    title: string;
    snippet: string;
    sourceCitation?: string;
  } | null>(null);
  const [recallToast, setRecallToast] = useState<string | null>(null);
  const highlightTimerRef = useRef<any>(null);

  const handleProcessFile = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);
    try {
      const parsed = await parseUploadedManuscriptFile(file);
      if (onImportManuscript) {
        onImportManuscript(parsed);
      } else if (activeChapter) {
        // Fallback if prop not provided: apply first chapter to active chapter
        if (parsed.chapters[0]) {
          activeChapter.title = parsed.chapters[0].title;
          activeChapter.contentHtml = parsed.chapters[0].contentHtml;
          activeChapter.wordCount = parsed.chapters[0].wordCount;
          if (editorRef.current) {
            editorRef.current.innerHTML = parsed.chapters[0].contentHtml;
          }
          handleInput();
        }
      }
    } catch (err: any) {
      console.error('File import error:', err);
      setUploadError(err?.message || 'Could not import draft file. Please ensure it is a valid .docx, .html, .md, or .txt file.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
    // reset input value so re-uploading same file name triggers change
    if (fileInputRef.current) fileInputRef.current.value = '';
  };


  // Helper to strip highlight mark tags
  const removeMarks = (html: string) => {
    return html.replace(/<mark id="search-match-\d+" class="[^"]*">(.*?)<\/mark>/g, '$1');
  };

  const clearHighlights = () => {
    if (editorRef.current) {
      editorRef.current.innerHTML = removeMarks(editorRef.current.innerHTML);
    }
  };

  // Keyboard shortcut listener for Ctrl+F / Cmd+F and Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 50);
      } else if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false);
        clearHighlights();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen]);

  // Execute Search & Highlight on current chapter
  const executeSearch = (query: string, activeIdx: number = 0, isCaseSensitive: boolean = matchCase) => {
    if (!editorRef.current || !activeChapter) return;
    
    // Always start from clean content without old marks
    const cleanHtml = removeMarks(editorRef.current.innerHTML);

    if (!query.trim()) {
      editorRef.current.innerHTML = cleanHtml;
      setTotalMatches(0);
      setCurrentMatchIndex(0);
      return;
    }

    const flags = isCaseSensitive ? 'g' : 'gi';
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    let matchCount = 0;

    // Split by HTML tags to only highlight text nodes
    const parts = cleanHtml.split(/(<[^>]*>)/);
    const highlightedParts = parts.map(part => {
      if (part.startsWith('<') && part.endsWith('>')) {
        return part;
      }
      const regex = new RegExp(escaped, flags);
      return part.replace(regex, (match) => {
        const isCurrent = matchCount === activeIdx;
        const id = `search-match-${matchCount}`;
        matchCount++;
        const styleClass = isCurrent
          ? 'bg-amber-400 text-stone-900 font-bold px-1 py-0.5 rounded shadow-xs ring-2 ring-amber-600'
          : 'bg-yellow-200 text-stone-900 px-0.5 rounded';
        return `<mark id="${id}" class="${styleClass}">${match}</mark>`;
      });
    });

    editorRef.current.innerHTML = highlightedParts.join('');
    setTotalMatches(matchCount);

    if (matchCount > 0) {
      const validIndex = activeIdx >= matchCount ? 0 : activeIdx;
      setCurrentMatchIndex(validIndex);
      setTimeout(() => {
        const activeEl = document.getElementById(`search-match-${validIndex}`);
        if (activeEl) {
          activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 50);
    } else {
      setCurrentMatchIndex(0);
    }
  };

  // Re-run search when query or active chapter changes
  useEffect(() => {
    if (searchOpen && searchQuery) {
      executeSearch(searchQuery, currentMatchIndex, matchCase);
    } else if (!searchOpen) {
      clearHighlights();
    }
  }, [searchQuery, matchCase, activeChapterId]);

  const handleNextMatch = () => {
    if (totalMatches === 0) return;
    const nextIdx = (currentMatchIndex + 1) % totalMatches;
    setCurrentMatchIndex(nextIdx);
    executeSearch(searchQuery, nextIdx, matchCase);
  };

  const handlePrevMatch = () => {
    if (totalMatches === 0) return;
    const prevIdx = (currentMatchIndex - 1 + totalMatches) % totalMatches;
    setCurrentMatchIndex(prevIdx);
    executeSearch(searchQuery, prevIdx, matchCase);
  };

  const handleReplaceCurrent = () => {
    if (!editorRef.current || totalMatches === 0) return;
    const activeEl = document.getElementById(`search-match-${currentMatchIndex}`);
    if (activeEl) {
      activeEl.outerHTML = replaceQuery;
      handleInput();
      executeSearch(searchQuery, currentMatchIndex, matchCase);
    }
  };

  const handleReplaceAll = () => {
    if (!editorRef.current || !searchQuery) return;
    const cleanHtml = removeMarks(editorRef.current.innerHTML);
    const flags = matchCase ? 'g' : 'gi';
    const escaped = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const parts = cleanHtml.split(/(<[^>]*>)/);
    const replaced = parts.map(part => {
      if (part.startsWith('<') && part.endsWith('>')) return part;
      return part.replace(new RegExp(escaped, flags), replaceQuery);
    }).join('');

    editorRef.current.innerHTML = replaced;
    handleInput();
    executeSearch(searchQuery, 0, matchCase);
  };

  // Search across all chapters in entire book
  const allChapterSearchResults = React.useMemo(() => {
    if (!searchQuery.trim() || searchScope !== 'all-chapters') return [];
    const flags = matchCase ? 'g' : 'gi';
    const escaped = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, flags);

    return chapters.map((ch, idx) => {
      const text = removeMarks(ch.contentHtml).replace(/<[^>]*>/g, ' ');
      const matches = text.match(regex);
      if (!matches || matches.length === 0) return null;

      const firstPos = matchCase 
        ? text.indexOf(searchQuery) 
        : text.toLowerCase().indexOf(searchQuery.toLowerCase());
      const start = Math.max(0, firstPos - 35);
      const end = Math.min(text.length, firstPos + searchQuery.length + 45);
      const snippet = text.slice(start, end).trim();

      return {
        chapterId: ch.id,
        chapterIndex: idx + 1,
        title: ch.title,
        matchCount: matches.length,
        snippet: `...${snippet}...`
      };
    }).filter(Boolean);
  }, [chapters, searchQuery, searchScope, matchCase]);

  const activeChapter = chapters.find(c => c.id === activeChapterId) || chapters[0];
  const chapterCitationNumbers = React.useMemo(() => {
    if (!activeChapter || typeof DOMParser === 'undefined') return [];
    const parsedChapter = new DOMParser().parseFromString(activeChapter.contentHtml, 'text/html');
    const knownNumbers = new Set(citations.map(citation => citation.number));
    const references = Array.from(parsedChapter.querySelectorAll('sup'))
      .map(marker => Number(marker.textContent?.match(/\[(\d+)\]/)?.[1]))
      .filter(number => Number.isInteger(number) && knownNumbers.has(number));
    return Array.from(new Set(references));
  }, [activeChapter?.contentHtml, citations]);
  const chapterWordCount = activeChapter?.wordCount ?? wordCount;
  const pendingConflictCount = conflicts.filter(conflict => conflict.status === 'pending').length;

  // Sync editor content when activeChapter changes
  useEffect(() => {
    if (editorRef.current && activeChapter) {
      if (editorRef.current.innerHTML !== activeChapter.contentHtml) {
        editorRef.current.innerHTML = activeChapter.contentHtml;
        updateWordCount();
      }
    }
  }, [activeChapterId, activeChapter?.contentHtml]);

  const updateWordCount = () => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || '';
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    setWordCount(words);
  };

  const handleInput = () => {
    if (!editorRef.current || !activeChapter) return;
    const html = editorRef.current.innerHTML;
    const text = editorRef.current.innerText || '';
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    setWordCount(words);
    onUpdateChapterContent(activeChapter.id, html, words);
  };

  const execCmd = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
    }
    handleInput();
  };

  // Export functions
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadDoc = () => {
    if (!activeChapter) return;
    const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${documentTitle} - ${activeChapter.title}</title>
        <style>
          body { font-family: 'Georgia', serif; line-height: 1.8; margin: 2in; color: #111; }
          h1 { text-align: center; font-size: 24pt; margin-bottom: 24pt; }
          h2 { font-size: 18pt; margin-top: 18pt; }
          p { margin-bottom: 12pt; text-indent: 0.5in; }
          .footnotes { margin-top: 36pt; border-top: 1px solid #ccc; padding-top: 12pt; font-size: 10pt; }
        </style>
      </head>
      <body>
        <h1>${documentTitle}</h1>
        <h2>${activeChapter.title}</h2>
        ${activeChapter.contentHtml}
        <div class="footnotes">
          <h3>Archival Citations & Sources</h3>
          <ul>
            ${citations.map(c => `<li>[${c.number}] ${c.fullCitation} (${c.sourceUrl})</li>`).join('')}
          </ul>
        </div>
      </body>
      </html>
    `;
    const blob = new Blob([fullHtml], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${documentTitle.replace(/\s+/g, '_')}_${activeChapter.title.replace(/\s+/g, '_')}.doc`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadTxt = () => {
    if (!editorRef.current || !activeChapter) return;
    const text = `${documentTitle}\n${activeChapter.title}\n\n${editorRef.current.innerText}\n\n--- ARCHIVAL CITATIONS ---\n` +
      citations.map(c => `[${c.number}] ${c.fullCitation}\nURL: ${c.sourceUrl}\n`).join('\n');
    
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeChapter.title.replace(/\s+/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Insert researched fact into text at current cursor
  const handleInsertFact = (fact: TimelineFact, source: RecordSource) => {
    if (!editorRef.current) return;
    editorRef.current.focus();

    const citationNum = citations.length + 1;
    const insertionText = ` According to ${source.provider === 'familysearch' ? 'FamilySearch records' : 'Ancestry.com archives'}, on ${fact.dateStr}, ${fact.description} [${citationNum}]. `;

    execCmd('insertHTML', insertionText);
    setShowFactInserter(false);
  };

  // Recall button handler: Automatically scrolls to & pulses the most recently added archival fact,
  // or surfaces the quick-integration flyout if it's not yet in the active draft.
  const handleRecallRecentFact = () => {
    if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);

    if (!editorRef.current || !activeChapter) return;

    // Prioritize recentArchivalFact if available
    const targetFact = recentArchivalFact;

    // Search in editor DOM
    let targetEl: HTMLElement | null = null;

    if (targetFact?.domElementId) {
      targetEl = editorRef.current.querySelector(`#${targetFact.domElementId}`);
    }

    if (!targetEl && targetFact?.id) {
      targetEl = editorRef.current.querySelector(`[data-archival-fact-id="${targetFact.id}"]`);
    }

    // Fallback 1: match text snippet in editor
    if (!targetEl && targetFact?.snippet && targetFact.snippet.length > 15) {
      const cleanSnippet = targetFact.snippet.slice(0, 35).toLowerCase();
      const candidates = editorRef.current.querySelectorAll('p, blockquote, div');
      for (const el of Array.from(candidates)) {
        if (el.textContent && el.textContent.toLowerCase().includes(cleanSnippet)) {
          targetEl = el as HTMLElement;
          break;
        }
      }
    }

    // Fallback 2: if no element matched targetFact, check if document has ANY existing archival note/callout
    if (!targetEl && !targetFact) {
      targetEl = editorRef.current.querySelector('.historical-context-callout:last-of-type, .archival-fact-item:last-of-type, blockquote:last-of-type') as HTMLElement | null;
    }

    // SCENARIO 1: Element is found in the current draft!
    if (targetEl) {
      // 1. Remove previous pulse from any other elements
      editorRef.current.querySelectorAll('.archival-highlight-pulse').forEach(el => {
        el.classList.remove('archival-highlight-pulse');
      });

      // 2. Smoothly scroll into view
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // 3. Apply golden spotlight highlight pulse
      targetEl.classList.add('archival-highlight-pulse');

      // 4. Set recalled info to render a sleek floating anchor badge / banner near it
      setRecalledHighlightInfo({
        id: targetFact?.id || 'archival_note',
        title: targetFact?.title || 'Archival Note in Draft',
        snippet: targetEl.innerText.slice(0, 160),
        sourceCitation: targetFact?.sourceCitation || 'Documented in Archival Citations'
      });

      setRecallToast(`Recalled & highlighted: "${targetFact?.title || 'Archival fact in draft'}"`);
      setShowRecallFlyout(false);

      // 5. Fade out pulse after 4.5 seconds
      highlightTimerRef.current = setTimeout(() => {
        targetEl?.classList.remove('archival-highlight-pulse');
      }, 4500);

      setTimeout(() => setRecallToast(null), 3500);
      return;
    }

    // SCENARIO 2: A recent fact exists, but is NOT yet inserted into this current draft!
    if (targetFact) {
      setShowRecallFlyout(true);
      setRecallToast('Saved research is ready to insert into the draft!');
      setTimeout(() => setRecallToast(null), 3500);
      return;
    }

    // SCENARIO 3: No recent fact or element
    setShowRecallFlyout(true);
  };

  // 1-Click integration of recalled fact into active chapter
  const handleInsertRecalledFactToDraft = () => {
    if (!editorRef.current || !activeChapter || !recentArchivalFact) return;
    editorRef.current.focus();

    const elementId = `archival-recalled-${Date.now()}`;
    let insertionHtml = '';

    if (recentArchivalFact.sourceType === 'chat') {
      const cleanNotes = recentArchivalFact.sourceCitation 
        ? `<br/><span class="text-stone-500 text-[11px] font-sans">${recentArchivalFact.sourceCitation.replace(/\n/g, '<br/>')}</span>` 
        : '';
      insertionHtml = `<blockquote id="${elementId}" data-archival-fact-id="${recentArchivalFact.id}" class="historical-context-callout archival-fact-item p-3.5 my-3 bg-amber-50/70 border-l-3 border-amber-800 rounded-r-lg font-serif text-stone-900 text-sm leading-relaxed shadow-2xs transition-all"><strong>Saved Archival Note:</strong> ${recentArchivalFact.fullText}${cleanNotes}</blockquote><p><br/></p>`;
    } else {
      const citeNumber = citations.length + 1;
      insertionHtml = `<p id="${elementId}" data-archival-fact-id="${recentArchivalFact.id}" class="archival-fact-item my-2 p-2 bg-amber-50/50 border-l-2 border-amber-700/60 rounded-r font-serif text-stone-900 text-sm leading-relaxed transition-all"><strong>Archival Discovery:</strong> ${recentArchivalFact.fullText || recentArchivalFact.snippet} <sup class="text-amber-800 font-bold">[${citeNumber}]</sup></p><p><br/></p>`;
    }

    // Insert at cursor if inside editor, or append
    let insertedInSelection = false;
    try {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && editorRef.current.contains(sel.anchorNode)) {
        execCmd('insertHTML', insertionHtml);
        insertedInSelection = true;
      }
    } catch (e) {
      insertedInSelection = false;
    }

    if (!insertedInSelection) {
      const updated = activeChapter.contentHtml + '\n' + insertionHtml;
      const words = wordCount + 25;
      onUpdateChapterContent(activeChapter.id, updated, words);
    }

    setShowRecallFlyout(false);

    if (onUpdateRecentArchivalFact) {
      onUpdateRecentArchivalFact({
        ...recentArchivalFact,
        domElementId: elementId
      });
    }

    // Scroll and highlight newly added element
    setTimeout(() => {
      const newEl = editorRef.current?.querySelector(`#${elementId}`) as HTMLElement | null;
      if (newEl) {
        newEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        newEl.classList.add('archival-highlight-pulse');
        setRecalledHighlightInfo({
          id: recentArchivalFact.id,
          title: recentArchivalFact.title,
          snippet: recentArchivalFact.snippet,
          sourceCitation: recentArchivalFact.sourceCitation
        });
        setTimeout(() => {
          newEl?.classList.remove('archival-highlight-pulse');
        }, 4500);
      }
    }, 120);

    setRecallToast('Fact successfully integrated and highlighted in current draft!');
    setTimeout(() => setRecallToast(null), 3500);
  };

  const insertPromptIntoDraft = (prompt: string) => {
    const promptHtml = `<p class="my-3 p-3 border-l-4 border-amber-700 bg-amber-50/80 rounded-r-lg font-serif-book text-stone-900"><strong>Memory Prompt:</strong> ${prompt}</p>`;

    try {
      const selection = window.getSelection();
      if (editorRef.current && selection && selection.rangeCount > 0 && editorRef.current.contains(selection.anchorNode)) {
        execCmd('insertHTML', promptHtml);
        return;
      }
    } catch (e) {
      // fall through to append if selection cannot be inserted into the editor
    }

    if (activeChapter) {
      onUpdateChapterContent(activeChapter.id, `${activeChapter.contentHtml}${promptHtml}`, wordCount + 18);
    }
  };

  // Dynamic font scale
  const scaleFontSize = 
    fontSizeScale === 'xlarge' ? customFontSize + 4 :
    fontSizeScale === 'large' ? customFontSize + 2 : customFontSize;

  const effectiveScale = writingModeEnabled ? Math.max(scaleFontSize, 22) : scaleFontSize;

  const fontClass = 
    editorFontFamily === 'serif' ? 'font-serif-book' :
    editorFontFamily === 'mono' ? 'font-mono-data' : 'font-sans-ui';

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-80px)] bg-[#F8F6F0]">
      
      {/* MODERN SLEEK WORKSPACE TOOLBAR (2-Tier Layout: Document Controls & Text Styling) */}
      <div className="bg-[#FAF9F5] border-b border-stone-200/90 shadow-xs flex flex-col no-print shrink-0">
        
        {/* Tier 1: Document Level Navigation & Primary Export Actions */}
        <div className="px-3 sm:px-4 py-2 border-b border-stone-200/70 flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
          
          {/* Left: Outline Toggle, Chapter Quick Switcher, Document Title */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold shrink-0 cursor-pointer ${
                sidebarOpen 
                  ? 'bg-amber-100/90 text-amber-900 border border-amber-300 shadow-2xs' 
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200'
              }`}
              title={sidebarOpen ? 'Hide Chapter Outline' : 'Show Chapter Outline'}
            >
              <Bookmark className="w-4 h-4 text-amber-800" />
              <span>Chapters ({chapters.length})</span>
            </button>

            {/* Quick Chapter Selector Dropdown */}
            <select
              value={activeChapter?.id}
              onChange={(e) => onSelectChapter(e.target.value)}
              className="bg-white border border-stone-300 rounded-lg px-2.5 py-1 text-xs font-serif-book font-medium text-stone-800 focus:outline-hidden focus:ring-1 focus:ring-amber-500 max-w-[190px] sm:max-w-xs truncate"
              title="Switch Current Chapter"
            >
              {chapters.map((ch, idx) => (
                <option key={ch.id} value={ch.id}>
                  {idx + 1}. {ch.title} ({ch.wordCount.toLocaleString()} w)
                </option>
              ))}
            </select>

            <span className="text-stone-300 hidden md:inline">|</span>

            <span className="text-xs text-stone-500 font-mono-data hidden lg:inline">
              {wordCount.toLocaleString()} words · {citations.length} cited
            </span>
          </div>

          {/* Right: Primary Download as PDF + Author Companion Actions */}
          <div className="flex items-center gap-2 shrink-0">

            <button
              onClick={() => setShowChapterReview(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-xl transition-colors shrink-0"
              title="Review chapter writing, citations, and open family conflicts"
            >
              <Check className="w-4 h-4" />
              <span>Review Chapter</span>
            </button>
            
            <button
              onClick={() => setWritingModeEnabled(prev => !prev)}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all shrink-0 cursor-pointer ${
                writingModeEnabled
                  ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                  : 'bg-stone-200 hover:bg-stone-300 text-stone-800 border border-stone-300'
              }`}
              title="Toggle Grandpa Writing Mode for easier reading and bigger text while drafting"
            >
              <BookOpen className="w-4 h-4" />
              <span className="font-semibold">{writingModeEnabled ? 'Writing Mode On' : 'Grandpa Writing Mode'}</span>
            </button>

            <button
              onClick={() => setIsPdfModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-bold bg-amber-800 hover:bg-amber-900 active:scale-98 text-white rounded-xl shadow-xs transition-all shrink-0 cursor-pointer"
              title="Preview, format, and download or print this chapter as a publication-ready PDF with archival citations"
            >
              <FileDown className="w-4 h-4 text-amber-200" />
              <span className="font-semibold">Download as PDF</span>
            </button>

            {/* DEDICATED ARCHIVAL RECALL BUTTON */}
            <button
              onClick={handleRecallRecentFact}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-bold bg-stone-900 hover:bg-stone-800 active:scale-98 text-amber-200 rounded-xl transition-all shadow-xs shrink-0 border border-stone-700 cursor-pointer group"
              title="Recall & automatically highlight the most recently added archival fact or note from Chat or Research"
            >
              <History className="w-4 h-4 text-amber-400 group-hover:rotate-[-45deg] transition-transform duration-300" />
              <span className="font-semibold">Recall</span>
              {recentArchivalFact && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="Archival discovery ready to highlight or integrate"></span>
              )}
            </button>

            {/* Upload Draft File Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl transition-all shadow-2xs shrink-0 cursor-pointer"
              title="Upload existing draft (.docx, .html, .md, .txt) keeping all layout and formatting"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Upload Draft</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".docx,.doc,.html,.htm,.md,.markdown,.txt,.rtf"
              onChange={handleFileSelected}
              className="hidden"
            />

            {/* Insert Researched Fact Button */}
            <button
              onClick={() => setShowFactInserter(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-amber-100 hover:bg-amber-200 active:scale-98 text-amber-950 rounded-xl transition-all shadow-2xs shrink-0 border border-amber-300 cursor-pointer"
              title="Insert researched ancestry fact & citation into your manuscript"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden sm:inline">Insert Fact</span>
            </button>

            {/* Companion Tools */}
            {onOpenVoiceRecorder && (
              <button
                onClick={onOpenVoiceRecorder}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-stone-700 hover:bg-stone-200/80 transition-colors shrink-0"
                title="Grandpa's Voice Dictation & Oral Memories Recorder"
              >
                <Mic className="w-3.5 h-3.5 text-red-600" />
                <span className="hidden md:inline">Voice</span>
              </button>
            )}

            {onOpenMapModal && (
              <button
                onClick={onOpenMapModal}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-stone-700 hover:bg-stone-200/80 transition-colors shrink-0"
                title="Open Fitts Village & St. James Ancestral Land Map"
              >
                <Compass className="w-3.5 h-3.5 text-amber-700" />
                <span className="hidden md:inline">Land Map</span>
              </button>
            )}

            {/* Quick Word export */}
            <button
              onClick={handleDownloadDoc}
              className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-200 rounded-lg transition-colors shrink-0"
              title="Download as Word Document (.doc)"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Direct Print */}
            <button
              onClick={handlePrint}
              className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-200 rounded-lg transition-colors shrink-0"
              title="Quick Print Current Chapter"
            >
              <Printer className="w-4 h-4" />
            </button>

          </div>
        </div>

        {/* Tier 2: Formatting Ribbon with Segmented Controls */}
        <div className="px-3 py-1.5 flex items-center gap-1 text-stone-700 text-xs overflow-x-auto no-scrollbar whitespace-nowrap">
          
          {/* Undo / Redo */}
          <div className="flex items-center bg-stone-100/90 rounded-lg p-0.5 border border-stone-200/80">
            <button
              onClick={() => execCmd('undo')}
              className="p-1 hover:bg-white rounded transition-colors text-stone-700"
              title="Undo (Ctrl+Z)"
            >
              <Undo className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => execCmd('redo')}
              className="p-1 hover:bg-white rounded transition-colors text-stone-700"
              title="Redo (Ctrl+Y)"
            >
              <Redo className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-4 w-px bg-stone-300/80 mx-1 shrink-0" />

          {/* Heading / Style Selector */}
          <select
            onChange={e => {
              const val = e.target.value;
              if (val === 'p') execCmd('formatBlock', '<p>');
              else if (val === 'h2') execCmd('formatBlock', '<h2>');
              else if (val === 'h3') execCmd('formatBlock', '<h3>');
              else if (val === 'h4') execCmd('formatBlock', '<h4>');
            }}
            className="bg-white border border-stone-300 rounded-lg px-2 py-1 text-xs text-stone-800 focus:outline-hidden"
            title="Paragraph Style"
          >
            <option value="p">Normal Text</option>
            <option value="h2">Section Title (H2)</option>
            <option value="h3">Subheading (H3)</option>
            <option value="h4">Minor Heading (H4)</option>
          </select>

          {/* Font Family Selector */}
          <select
            value={editorFontFamily}
            onChange={e => setEditorFontFamily(e.target.value as any)}
            className="bg-white border border-stone-300 rounded-lg px-2 py-1 text-xs text-stone-800 focus:outline-hidden"
            title="Book Font"
          >
            <option value="serif">Book Serif (Lora)</option>
            <option value="sans">Clean Modern (Sans)</option>
            <option value="mono">Typewriter (Monospace)</option>
          </select>

          {/* Font Size Adjusters */}
          <div className="flex items-center bg-white border border-stone-300 rounded-lg">
            <button
              onClick={() => setCustomFontSize(Math.max(12, customFontSize - 2))}
              className="p-1 hover:bg-stone-100 text-stone-600 rounded-l-lg"
              title="Decrease Font Size"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="px-2 font-mono-data text-xs text-stone-800 font-medium">
              {scaleFontSize}pt
            </span>
            <button
              onClick={() => setCustomFontSize(Math.min(32, customFontSize + 2))}
              className="p-1 hover:bg-stone-100 text-stone-600 rounded-r-lg"
              title="Increase Font Size"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          <div className="h-4 w-px bg-stone-300/80 mx-1 shrink-0" />

          {/* Inline Text Formatting: Bold, Italic, Underline, Strikethrough */}
          <div className="flex items-center bg-stone-100/90 rounded-lg p-0.5 border border-stone-200/80">
            <button
              onClick={() => execCmd('bold')}
              className="p-1.5 hover:bg-white rounded font-bold transition-colors text-stone-800"
              title="Bold (Ctrl+B)"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => execCmd('italic')}
              className="p-1.5 hover:bg-white rounded italic transition-colors text-stone-800"
              title="Italic (Ctrl+I)"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => execCmd('underline')}
              className="p-1.5 hover:bg-white rounded underline transition-colors text-stone-800"
              title="Underline (Ctrl+U)"
            >
              <Underline className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => execCmd('strikeThrough')}
              className="p-1.5 hover:bg-white rounded line-through transition-colors text-stone-800"
              title="Strikethrough"
            >
              <Strikethrough className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-4 w-px bg-stone-300/80 mx-1 shrink-0" />

          {/* Alignment */}
          <div className="flex items-center bg-stone-100/90 rounded-lg p-0.5 border border-stone-200/80">
            <button
              onClick={() => execCmd('justifyLeft')}
              className="p-1.5 hover:bg-white rounded transition-colors text-stone-800"
              title="Align Left"
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => execCmd('justifyCenter')}
              className="p-1.5 hover:bg-white rounded transition-colors text-stone-800"
              title="Align Center"
            >
              <AlignCenter className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => execCmd('justifyRight')}
              className="p-1.5 hover:bg-white rounded transition-colors text-stone-800"
              title="Align Right"
            >
              <AlignRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => execCmd('justifyFull')}
              className="p-1.5 hover:bg-white rounded transition-colors text-stone-800"
              title="Justify"
            >
              <AlignJustify className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-4 w-px bg-stone-300/80 mx-1 shrink-0" />

          {/* Lists & Quotes */}
          <div className="flex items-center bg-stone-100/90 rounded-lg p-0.5 border border-stone-200/80">
            <button
              onClick={() => execCmd('insertUnorderedList')}
              className="p-1.5 hover:bg-white rounded transition-colors text-stone-800"
              title="Bulleted List"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => execCmd('insertOrderedList')}
              className="p-1.5 hover:bg-white rounded transition-colors text-stone-800"
              title="Numbered List"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => execCmd('formatBlock', '<blockquote>')}
              className="p-1.5 hover:bg-white rounded transition-colors text-stone-800"
              title="Insert Historical Blockquote"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => execCmd('insertHorizontalRule')}
              className="p-1.5 hover:bg-white rounded transition-colors text-stone-800"
              title="Insert Chapter Divider"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-4 w-px bg-stone-300/80 mx-1 shrink-0" />

          {/* Find & Search in Document */}
          <button
            onClick={() => {
              const nextOpen = !searchOpen;
              setSearchOpen(nextOpen);
              if (nextOpen) {
                setTimeout(() => searchInputRef.current?.focus(), 50);
              } else {
                clearHighlights();
              }
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
              searchOpen
                ? 'bg-amber-800 text-white shadow-2xs'
                : 'hover:bg-stone-200 text-stone-700 bg-white border border-stone-300'
            }`}
            title="Find and replace text in manuscript (Ctrl+F)"
            aria-label="Find and replace text in manuscript"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden sm:inline font-mono-data text-[10px] bg-black/10 px-1 rounded">Ctrl+F</kbd>
          </button>

        </div>
      </div>

      {/* GOOGLE DOCS STYLE FLOATING FIND & REPLACE BAR */}
      {searchOpen && (
        <div className="bg-white border-b border-amber-200 shadow-md px-4 py-2.5 z-20 flex flex-col gap-2 no-print">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[280px]">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Find in manuscript..."
                  value={searchQuery}
                  onChange={e => {
                    const val = e.target.value;
                    setSearchQuery(val);
                    executeSearch(val, 0, matchCase);
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      if (e.shiftKey) handlePrevMatch();
                      else handleNextMatch();
                    } else if (e.key === 'Escape') {
                      setSearchOpen(false);
                      clearHighlights();
                    }
                  }}
                  className="w-full pl-8 pr-20 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white text-stone-900"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-mono-data text-stone-500">
                  {totalMatches > 0 ? `${currentMatchIndex + 1}/${totalMatches}` : searchQuery ? '0 found' : ''}
                </span>
              </div>

              {/* Prev / Next buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrevMatch}
                  disabled={totalMatches === 0}
                  className="p-1.5 bg-stone-100 hover:bg-stone-200 disabled:opacity-40 rounded text-stone-700"
                  title="Previous match (Shift+Enter)"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleNextMatch}
                  disabled={totalMatches === 0}
                  className="p-1.5 bg-stone-100 hover:bg-stone-200 disabled:opacity-40 rounded text-stone-700"
                  title="Next match (Enter)"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Match Case Toggle */}
              <button
                onClick={() => {
                  const newCase = !matchCase;
                  setMatchCase(newCase);
                  executeSearch(searchQuery, 0, newCase);
                }}
                className={`px-2 py-1 rounded text-xs font-mono-data font-semibold border transition-colors ${
                  matchCase 
                    ? 'bg-amber-100 border-amber-400 text-amber-900' 
                    : 'bg-stone-100 border-stone-200 text-stone-600 hover:bg-stone-200'
                }`}
                title="Match Case (Aa)"
              >
                Aa
              </button>

              {/* Scope Selector: Current Chapter vs Whole Book */}
              <div className="flex items-center bg-stone-100 p-0.5 rounded-lg border border-stone-200 text-xs">
                <button
                  onClick={() => setSearchScope('chapter')}
                  className={`px-2 py-1 rounded transition-colors ${
                    searchScope === 'chapter' ? 'bg-white shadow-2xs font-semibold text-stone-900' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Current Chapter
                </button>
                <button
                  onClick={() => setSearchScope('all-chapters')}
                  className={`px-2 py-1 rounded transition-colors ${
                    searchScope === 'all-chapters' ? 'bg-white shadow-2xs font-semibold text-stone-900' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Entire Book
                </button>
              </div>

              {/* Toggle Replace Row */}
              <button
                onClick={() => setShowReplace(!showReplace)}
                className={`px-2.5 py-1 text-xs rounded border transition-colors ${
                  showReplace 
                    ? 'bg-amber-100 border-amber-300 text-amber-900 font-semibold' 
                    : 'bg-stone-100 border-stone-200 text-stone-700 hover:bg-stone-200'
                }`}
              >
                Replace...
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={() => {
                setSearchOpen(false);
                clearHighlights();
              }}
              className="p-1 text-stone-400 hover:text-stone-700 rounded"
              title="Close search (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Replace Row */}
          {showReplace && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-100">
              <input
                type="text"
                placeholder="Replace with..."
                value={replaceQuery}
                onChange={e => setReplaceQuery(e.target.value)}
                className="w-72 px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white text-stone-900"
              />
              <button
                onClick={handleReplaceCurrent}
                disabled={totalMatches === 0}
                className="px-3 py-1.5 text-xs font-semibold bg-stone-800 hover:bg-stone-700 disabled:opacity-40 text-white rounded-lg transition-colors"
              >
                Replace
              </button>
              <button
                onClick={handleReplaceAll}
                disabled={totalMatches === 0}
                className="px-3 py-1.5 text-xs font-semibold bg-amber-700 hover:bg-amber-800 disabled:opacity-40 text-white rounded-lg transition-colors"
              >
                Replace All in Chapter
              </button>
            </div>
          )}

          {/* All Chapters Results Dropdown */}
          {searchScope === 'all-chapters' && searchQuery && (
            <div className="mt-2 p-3 bg-amber-50/60 rounded-lg border border-amber-200 max-h-48 overflow-y-auto space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                <span>Matches Across Entire Book ({allChapterSearchResults.reduce((sum, r: any) => sum + r.matchCount, 0)} total):</span>
                <span className="text-[11px] font-normal text-amber-700">Click a chapter to open and highlight</span>
              </div>
              {allChapterSearchResults.length === 0 ? (
                <p className="text-xs text-stone-500 italic">No matches found in any chapter.</p>
              ) : (
                allChapterSearchResults.map((res: any) => (
                  <div
                    key={res.chapterId}
                    onClick={() => {
                      onSelectChapter(res.chapterId);
                      setSearchScope('chapter');
                    }}
                    className={`p-2 rounded border cursor-pointer text-xs transition-colors flex items-start justify-between gap-3 ${
                      res.chapterId === activeChapter.id
                        ? 'bg-amber-100/80 border-amber-300 font-medium'
                        : 'bg-white hover:bg-amber-100/40 border-stone-200'
                    }`}
                  >
                    <div>
                      <span className="font-semibold text-stone-900">{res.title}</span>
                      <p className="text-stone-600 text-[11px] font-serif-book mt-0.5">{res.snippet}</p>
                    </div>
                    <span className="px-2 py-0.5 bg-amber-200 text-amber-900 font-bold rounded text-[10px] shrink-0 font-mono-data">
                      {res.matchCount} {res.matchCount === 1 ? 'match' : 'matches'}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* MAIN WRITING VIEWPORT WITH CHAPTER SIDEBAR */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Chapter Outline Sidebar */}
        {sidebarOpen && (
          <>
            {/* Mobile backdrop */}
            <div
              onClick={() => setSidebarOpen(false)}
              className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-xs"
            />
            <aside className="fixed md:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-stone-200 flex flex-col shrink-0 no-print shadow-2xl md:shadow-none animate-in slide-in-from-left duration-200">
              <div className="p-3 border-b border-stone-200 flex items-center justify-between">
                <span className="font-bold text-xs uppercase tracking-wider text-stone-600">
                  Book Chapters ({chapters.length})
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={onAddChapter}
                    className="p-1 text-amber-700 hover:bg-amber-50 rounded flex items-center gap-1 text-xs font-semibold"
                    title="Add New Chapter"
                  >
                    <PlusCircle className="w-3.5 h-3.5" /> New Chapter
                  </button>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="md:hidden p-1 text-stone-400 hover:text-stone-700 rounded"
                    title="Close outline"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {chapters.map((ch, idx) => {
                  const isActive = ch.id === activeChapter?.id;
                  return (
                    <div
                      key={ch.id}
                      onClick={() => {
                        onSelectChapter(ch.id);
                        if (window.innerWidth < 768) setSidebarOpen(false);
                      }}
                      className={`p-2.5 rounded-lg text-left cursor-pointer transition-all flex items-start justify-between gap-2 group ${
                        isActive 
                          ? 'bg-amber-50 border border-amber-300 text-stone-900 shadow-2xs' 
                          : 'hover:bg-stone-100 text-stone-700 border border-transparent'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-mono-data text-amber-800 font-bold">
                            {idx + 1}.
                          </span>
                          <h4 className="font-semibold text-xs truncate">
                            {ch.title}
                          </h4>
                        </div>
                        {ch.subtitle && (
                          <p className="text-[11px] text-stone-500 truncate mt-0.5">
                            {ch.subtitle}
                          </p>
                        )}
                        <span className="text-[10px] text-stone-400 font-mono-data mt-1 block">
                          {ch.wordCount.toLocaleString()} words
                        </span>
                      </div>

                      {chapters.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Delete "${ch.title}"?`)) {
                              onDeleteChapter(ch.id);
                            }
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-stone-400 hover:text-red-600 transition-opacity"
                          title="Delete Chapter"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Total Book Progress */}
              <div className="p-3 border-t border-stone-200 bg-stone-50 text-xs text-stone-600 space-y-1">
                <div className="flex justify-between">
                  <span>Total Words:</span>
                  <span className="font-mono-data font-bold text-stone-800">
                    {chapters.reduce((sum, c) => sum + c.wordCount, 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Reading Time:</span>
                  <span className="text-stone-700">
                    ~{Math.max(1, Math.round(chapters.reduce((sum, c) => sum + c.wordCount, 0) / 200))} mins
                  </span>
                </div>
              </div>
            </aside>
          </>
        )}

        {/* Center: Google Docs Paper Canvas with Realistic Paper Shadow & Margins */}
        <main 
          id="manuscript_scroll_container"
          className="flex-1 overflow-y-auto px-2 sm:px-6 py-3 sm:py-8 flex flex-col items-center"
        >
          {/* Centered White Document Page */}
          <div className="w-full max-w-[850px] bg-white rounded-xl sm:rounded-sm shadow-md border border-stone-300 min-h-[900px] p-4 sm:p-12 lg:p-16 space-y-5 sm:space-y-6 print-page">
            
            {/* Chapter Header */}
            <div className="border-b border-stone-200 pb-4">
              <input
                type="text"
                value={activeChapter?.title || ''}
                onChange={e => {
                  if (activeChapter) {
                    activeChapter.title = e.target.value;
                    handleInput();
                  }
                }}
                className="text-2xl sm:text-3xl font-bold font-serif-book text-stone-900 w-full focus:outline-hidden hover:bg-stone-50 px-1 rounded transition-colors"
                placeholder="Chapter Title..."
              />
              <input
                type="text"
                value={activeChapter?.subtitle || ''}
                onChange={e => {
                  if (activeChapter) {
                    activeChapter.subtitle = e.target.value;
                    handleInput();
                  }
                }}
                className="text-sm font-sans-ui text-stone-500 w-full focus:outline-hidden hover:bg-stone-50 px-1 rounded transition-colors mt-1"
                placeholder="Optional chapter subtitle or date range..."
              />
            </div>

            {/* If chapter content is empty, show welcoming blank slate with upload drop zone */}
            {(!activeChapter?.contentHtml || activeChapter.contentHtml.trim() === '') && (
              <div 
                onDragOver={(e) => { e.preventDefault(); setIsDraggingFile(true); }}
                onDragLeave={() => setIsDraggingFile(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingFile(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleProcessFile(file);
                }}
                className={`p-6 sm:p-8 rounded-xl border-2 border-dashed transition-all flex flex-col items-center text-center no-print ${
                  isDraggingFile 
                    ? 'border-blue-500 bg-blue-50/80 scale-[1.01]' 
                    : 'border-stone-300 bg-stone-50/60 hover:bg-stone-50 hover:border-amber-400'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center mb-3 shadow-xs">
                  <UploadCloud className="w-7 h-7 text-amber-700" />
                </div>

                <h3 className="text-lg font-bold text-stone-900 font-serif-book">
                  Start Typing or Upload Your Existing Manuscript
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 max-w-lg mt-1 mb-4 leading-normal">
                  Grandpa Ward can start writing on this clean page, or click below to upload an existing draft file.
                  KinScribe will preserve your headings, paragraphs, bold/italics, and chapter formatting!
                </p>

                {uploadError && (
                  <div className="mb-3 px-3 py-1.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-medium">
                    {uploadError}
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-colors"
                  >
                    <FileUp className="w-4 h-4" />
                    <span>{isUploading ? 'Importing & Preserving Formatting...' : 'Upload Existing File (.docx, .html, .md, .txt)'}</span>
                  </button>

                  <button
                    onClick={() => {
                      if (editorRef.current) {
                        editorRef.current.focus();
                      }
                    }}
                    className="px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-200/70 rounded-xl transition-colors border border-stone-300"
                  >
                    Or Start Typing Below ↓
                  </button>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-200/80 flex flex-wrap items-center justify-center gap-3 text-[11px] text-stone-500">
                  <span className="flex items-center gap-1 font-medium text-stone-700">
                    <FileType className="w-3.5 h-3.5 text-blue-600" /> Word (.docx)
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1 font-medium text-stone-700">
                    <FileCode className="w-3.5 h-3.5 text-amber-700" /> HTML (.html)
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1 font-medium text-stone-700">
                    <FileText className="w-3.5 h-3.5 text-emerald-700" /> Markdown (.md)
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1 font-medium text-stone-700">
                    <FileText className="w-3.5 h-3.5 text-stone-600" /> Plain Text (.txt)
                  </span>
                </div>
              </div>
            )}

            {showPromptCards && (
              <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50/80 p-3 shadow-xs">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-900">Story prompts</div>
                    <div className="text-xs text-stone-700">Quick memory starters for the chapter you’re drafting</div>
                  </div>
                  <button
                    onClick={() => setShowPromptCards(false)}
                    className="text-[10px] font-semibold text-stone-600 hover:text-stone-900"
                  >
                    Hide
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {WRITING_PROMPTS.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => insertPromptIntoDraft(prompt)}
                      className="rounded-xl border border-amber-200 bg-white px-3 py-2 text-left text-xs text-stone-700 transition-colors hover:border-amber-400 hover:bg-amber-100/70"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div
              ref={editorRef}
              contentEditable
              onInput={handleInput}
              style={{ fontSize: `${effectiveScale}px` }}
              className={`min-h-[450px] focus:outline-hidden text-stone-900 leading-relaxed space-y-4 ${fontClass} selection:bg-amber-100 empty:before:content-[attr(data-placeholder)] empty:before:text-stone-400 select-text`}
              data-placeholder="Click here to begin writing your manuscript chapter..."
            />

            {/* Footnotes & Archival Citations Section */}
            <div className="pt-8 mt-12 border-t-2 border-stone-200 text-xs text-stone-600 space-y-3 font-sans-ui archival-citations-block">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <BookMarked className="w-4 h-4 text-amber-800" />
                  <h3 className="font-bold uppercase tracking-wider text-stone-800">
                    Archival Citations & Verified Sources ({citations.length})
                  </h3>
                </div>
                <button
                  onClick={() => setIsPdfModalOpen(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 rounded-lg transition-colors cursor-pointer no-print shadow-2xs"
                  title="Generate printable PDF of this chapter with citations"
                >
                  <FileDown className="w-3.5 h-3.5 text-amber-700" />
                  <span>Download as PDF</span>
                </button>
              </div>

              {citations.length === 0 ? (
                <p className="text-stone-400 italic">
                  No citations added yet. Click <em>"Cite in Book"</em> on any fact in the Research tab or use the <em>"Insert Researched Fact"</em> button above to automatically link proof records!
                </p>
              ) : (
                <ol className="space-y-2 list-decimal list-inside text-stone-700">
                  {citations.map((cite, idx) => (
                    <li key={cite.id} className="leading-normal hover:bg-stone-50 p-1 rounded">
                      <span className="font-semibold text-stone-900">
                        [{cite.number || idx + 1}] {cite.eventTitle} ({cite.ancestorName}):
                      </span>{' '}
                      <span className="text-stone-700 font-serif-book">{cite.fullCitation}</span>{' '}
                      <a
                        href={cite.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-0.5 text-blue-700 hover:underline font-medium ml-1"
                      >
                        Verify on {cite.provider === 'familysearch' ? 'FamilySearch' : 'Ancestry'} <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </li>
                  ))}
                </ol>
              )}
            </div>

          </div>

          {/* Footer stats below page */}
          <div className="mt-4 text-xs text-stone-500 font-mono-data no-print">
            Page 1 · {wordCount} words in this chapter · Auto-saved to browser storage
          </div>
        </main>

      </div>

      {/* QUICK FACT INSERTER MODAL */}
      {showFactInserter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white max-w-xl w-full rounded-xl shadow-2xl border border-stone-300 p-6 text-stone-900 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-700" />
                <h3 className="font-bold text-stone-900 text-base">
                  Insert Researched Fact into Manuscript
                </h3>
              </div>
              <button onClick={() => setShowFactInserter(false)} className="text-stone-400 hover:text-stone-700">
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-600">
              Select any verified record from your research. KinScribe will insert the historical sentence right into your chapter and create a footnote citation with a live link back to FamilySearch or Ancestry:
            </p>

            <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
              {allFacts.slice(0, 8).map(fact => {
                const anc = ancestors.find(a => a.id === fact.ancestorId);
                const src = fact.sources[0];

                return (
                  <div
                    key={fact.id}
                    className="p-3 bg-stone-50 hover:bg-amber-50/60 rounded-lg border border-stone-200 hover:border-amber-300 transition-colors flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-amber-900 font-mono-data">
                          {fact.year}
                        </span>
                        <span className="font-semibold text-stone-800">
                          {fact.title}
                        </span>
                        <span className="text-[10px] text-stone-500 bg-white px-1.5 py-0.2 rounded border">
                          {anc?.name}
                        </span>
                      </div>
                      <p className="text-stone-600 line-clamp-2">
                        {fact.description}
                      </p>
                      <div className="text-[11px] text-stone-500">
                        Source: {src.sourceTitle} ({src.provider === 'familysearch' ? 'FamilySearch' : 'Ancestry'})
                      </div>
                    </div>

                    <button
                      onClick={() => handleInsertFact(fact, src)}
                      className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-amber-200 font-semibold rounded-md shrink-0 shadow-2xs"
                    >
                      Insert & Cite
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowFactInserter(false)}
                className="px-4 py-2 text-xs text-stone-600 hover:bg-stone-100 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHAPTER PDF EXPORT & PUBLICATION PREVIEW MODAL */}
      <ChapterPdfExportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        chapter={activeChapter}
        documentTitle={documentTitle}
        citations={citations}
      />

      {showChapterReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="chapter-review-title"
            className="bg-white max-w-lg w-full max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl border border-stone-300 p-5 sm:p-6 text-stone-900"
          >
            <div className="flex items-start justify-between gap-4 border-b border-stone-200 pb-4">
              <div>
                <h2 id="chapter-review-title" className="text-lg font-bold font-serif-book">Chapter Review</h2>
                <p className="text-sm text-stone-600 mt-1">{activeChapter?.title || 'Current chapter'}</p>
              </div>
              <button
                onClick={() => setShowChapterReview(false)}
                className="min-w-11 min-h-11 rounded-lg text-stone-500 hover:bg-stone-100"
                aria-label="Close chapter review"
              >
                <X className="w-5 h-5 mx-auto" />
              </button>
            </div>

            <div className="divide-y divide-stone-200">
              <div className="py-4 flex items-start gap-3">
                <span className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full ${chapterWordCount > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  {chapterWordCount > 0 ? <Check className="w-4 h-4" /> : '!'}
                </span>
                <div>
                  <p className="font-semibold">Draft text</p>
                  <p className="text-sm text-stone-600">{chapterWordCount.toLocaleString()} words in this chapter.</p>
                </div>
              </div>

              <div className="py-4 flex items-start gap-3">
                <span className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full ${chapterCitationNumbers.length > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  {chapterCitationNumbers.length > 0 ? <Check className="w-4 h-4" /> : '!'}
                </span>
                <div>
                  <p className="font-semibold">Numbered citations in this chapter</p>
                  <p className="text-sm text-stone-600">
                    {chapterCitationNumbers.length > 0
                      ? `${chapterCitationNumbers.length} reference${chapterCitationNumbers.length === 1 ? '' : 's'}: ${chapterCitationNumbers.map(number => `[${number}]`).join(', ')}`
                      : 'No numbered source references found in this chapter yet.'}
                  </p>
                </div>
              </div>

              <div className="py-4 flex items-start gap-3">
                <span className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full ${pendingConflictCount === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  {pendingConflictCount === 0 ? <Check className="w-4 h-4" /> : '!'}
                </span>
                <div>
                  <p className="font-semibold">Open family-record conflicts</p>
                  <p className="text-sm text-stone-600">
                    {pendingConflictCount === 0
                      ? 'No pending conflicts across the family file.'
                      : `${pendingConflictCount} pending conflict${pendingConflictCount === 1 ? '' : 's'} across the family file; review these in Genealogy Research.`}
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-3 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-950">
              Before publishing, check names, dates, and places against the original records. This checklist counts inserted citation markers; it cannot judge whether every claim is supported.
            </p>

            <div className="flex justify-end mt-5">
              <button
                onClick={() => setShowChapterReview(false)}
                className="min-h-11 px-5 rounded-lg bg-stone-900 text-white font-semibold hover:bg-stone-800"
              >
                Close Review
              </button>
            </div>
          </section>
        </div>
      )}

      {/* FLOATING RECALL HIGHLIGHT ACTIVE BADGE (when element in draft is highlighted) */}
      {recalledHighlightInfo && (
        <div className="fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 z-40 bg-stone-900/95 text-stone-100 backdrop-blur-md px-4 py-3 rounded-2xl shadow-2xl border border-amber-500/50 flex items-center gap-3 text-xs animate-in fade-in slide-in-from-bottom-3 duration-300 max-w-xl w-[92%] sm:w-auto">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 border border-amber-500/40">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-amber-200 truncate">{recalledHighlightInfo.title}</span>
              <span className="text-[10px] uppercase font-mono-data bg-amber-900/90 text-amber-300 px-1.5 py-0.5 rounded border border-amber-700/60 shrink-0">
                Highlighted in Draft
              </span>
            </div>
            <p className="text-[11px] text-stone-300 truncate mt-0.5 font-serif-book">
              {recalledHighlightInfo.snippet}
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => {
                const textToCopy = `${recalledHighlightInfo.snippet}\nSource: ${recalledHighlightInfo.sourceCitation || ''}`;
                navigator.clipboard.writeText(textToCopy);
                setRecallToast('Citation copied to clipboard!');
                setTimeout(() => setRecallToast(null), 2500);
              }}
              className="p-1.5 hover:bg-stone-800 text-stone-300 hover:text-white rounded-lg transition-colors cursor-pointer"
              title="Copy citation to clipboard"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={() => setRecalledHighlightInfo(null)}
              className="p-1.5 hover:bg-stone-800 text-stone-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              title="Dismiss highlight badge"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* RECALL QUICK-INTEGRATION FLYOUT for saved research and conflict notes */}
      {showRecallFlyout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#FAF9F5] max-w-xl w-full rounded-2xl shadow-2xl border border-stone-300 p-6 text-stone-900 space-y-4">
            
            {/* Flyout Header */}
            <div className="flex items-center justify-between border-b border-stone-200/90 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-stone-900 text-amber-300 flex items-center justify-center shadow-xs">
                  <History className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-stone-900 font-serif-book text-base">
                      Recalled Archival Fact
                    </h3>
                    <span className="text-[10px] uppercase font-mono-data px-2 py-0.5 rounded-full font-semibold border bg-amber-100 text-amber-900 border-amber-300">
                      {recentArchivalFact?.sourceType === 'conflict' ? 'Conflict Resolution' : 'Saved Research'}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 font-sans-ui mt-0.5">
                    Most recently recorded archival note ready for 1-click integration
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowRecallFlyout(false)} 
                className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Fact Body */}
            {recentArchivalFact ? (
              <div className="space-y-3.5">
                <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-stone-900 font-serif-book">
                      {recentArchivalFact.title}
                    </h4>
                    <span className="text-[11px] text-stone-400 font-mono-data">
                      {new Date(recentArchivalFact.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-800 font-serif-book leading-relaxed bg-amber-50/40 p-3 rounded-lg border-l-3 border-amber-800">
                    {recentArchivalFact.fullText || recentArchivalFact.snippet}
                  </p>
                  {recentArchivalFact.sourceCitation && (
                    <div className="pt-2 text-[11px] text-stone-500 font-sans-ui border-t border-stone-100">
                      <strong className="text-stone-700">Archival Citation:</strong> {recentArchivalFact.sourceCitation}
                    </div>
                  )}
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const copyStr = `${recentArchivalFact.fullText || recentArchivalFact.snippet}\nSource: ${recentArchivalFact.sourceCitation || ''}`;
                        navigator.clipboard.writeText(copyStr);
                        setRecallToast('Copied fact and citation to clipboard!');
                        setTimeout(() => setRecallToast(null), 2500);
                      }}
                      className="px-3 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5 text-stone-600" />
                      <span>Copy Citation</span>
                    </button>

                  </div>

                  <button
                    onClick={handleInsertRecalledFactToDraft}
                    className="px-4 py-2 text-xs sm:text-sm font-bold bg-amber-900 hover:bg-stone-900 text-amber-200 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <PlusCircle className="w-4 h-4 text-amber-300" />
                    <span>Insert into Chapter Draft</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 space-y-3">
                <p className="text-sm text-stone-600">
                  No recently researched archival facts or notes were found yet.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* RECALL TEMPORARY TOAST */}
      {recallToast && (
        <div className="fixed bottom-20 md:bottom-6 right-6 z-50 bg-stone-900 text-white px-4 py-2.5 rounded-xl shadow-2xl border border-amber-600/50 flex items-center gap-2 text-xs animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-md">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
          <span className="font-medium text-amber-100 truncate">{recallToast}</span>
        </div>
      )}

    </div>
  );
};
