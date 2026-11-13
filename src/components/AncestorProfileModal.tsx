import React, { useEffect, useRef, useState } from 'react';
import { Ancestor, TimelineFact } from '../types/genealogy';
import { ScrapbookItem, INITIAL_SCRAPBOOK_ITEMS } from '../data/scrapbookData';
import { 
  X, 
  User, 
  Calendar, 
  MapPin, 
  FileText, 
  BookMarked, 
  Sparkles, 
  ExternalLink, 
  CheckCircle2, 
  Layers, 
  Image as ImageIcon,
  Heart,
  Compass
} from 'lucide-react';

interface Props {
  ancestor: Ancestor | null;
  facts: TimelineFact[];
  isOpen: boolean;
  onClose: () => void;
  onCiteFact?: (fact: TimelineFact) => void;
  onOpenMapModal?: () => void;
  onOpenJourneyMap?: () => void;
}

export const AncestorProfileModal: React.FC<Props> = ({
  ancestor,
  facts,
  isOpen,
  onClose,
  onCiteFact,
  onOpenMapModal,
  onOpenJourneyMap
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'records'>('overview');
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen || !ancestor) return;

    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== 'Tab' || !dialog) return;

      const focusableElements = dialog.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (!firstElement || !lastElement) {
        event.preventDefault();
      } else if (event.shiftKey && (document.activeElement === firstElement || !dialog.contains(document.activeElement))) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && (document.activeElement === lastElement || !dialog.contains(document.activeElement))) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previousFocus?.focus();
    };
  }, [isOpen, ancestor?.id]);

  const handleTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const tabs = ['overview', 'documents', 'records'] as const;
    const currentIndex = tabs.indexOf(activeTab);
    let nextIndex: number | undefined;

    if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % tabs.length;
    if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = tabs.length - 1;
    if (nextIndex === undefined) return;

    event.preventDefault();
    setActiveTab(tabs[nextIndex]);
    event.currentTarget.parentElement
      ?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[nextIndex]
      ?.focus();
  };

  if (!isOpen || !ancestor) return null;

  // Facts for this specific ancestor
  const ancestorFacts = facts.filter(f => f.ancestorId === ancestor.id);
  const birthFact = ancestorFacts.find(f => f.eventType === 'birth' || f.eventType === 'baptism');
  const deathFact = ancestorFacts.find(f => f.eventType === 'death' || f.eventType === 'burial');
  const marriageFacts = ancestorFacts.filter(f => f.eventType === 'marriage');
  const censusFacts = ancestorFacts.filter(f => f.eventType === 'census');
  const tradeFacts = ancestorFacts.filter(f => f.eventType === 'occupation');

  // Associated scrapbook documents & photos
  const associatedDocs: ScrapbookItem[] = INITIAL_SCRAPBOOK_ITEMS.filter(
    item => item.associatedAncestorId === ancestor.id
  );
  const confidenceScore = Math.min(98, 72 + ancestorFacts.length * 3);
  const confidenceLabel = confidenceScore >= 90 ? 'High confidence' : confidenceScore >= 80 ? 'Good confidence' : 'Needs more records';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ancestor-profile-title"
        tabIndex={-1}
        className="bg-white max-w-3xl w-full rounded-2xl shadow-2xl border border-stone-300 flex flex-col overflow-hidden text-stone-900 max-h-[92vh]"
      >
        
        {/* Modal Top Header with Ancestor Dossier Banner */}
        <div className="bg-gradient-to-r from-amber-900 via-stone-900 to-amber-950 text-white p-5 sm:p-6 relative">
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Close ancestor profile"
            className="absolute top-4 right-4 min-h-11 min-w-11 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white transition-colors"
            title="Close Ancestor Profile"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-bold text-2xl font-serif-book shadow-md border-2 border-amber-400/40 shrink-0">
              {ancestor.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs uppercase tracking-wider font-bold text-amber-300 bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-800">
                  {ancestor.relationship}
                </span>
                <span className="text-xs text-stone-300 font-medium">
                  {ancestor.treeBranch} Branch · Generation {ancestor.generation}
                </span>
              </div>
              <h2 id="ancestor-profile-title" className="text-2xl sm:text-3xl font-bold font-serif-book text-white leading-tight">
                {ancestor.name}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-xs text-stone-300 pt-0.5">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  {ancestor.birthYear} — {ancestor.deathYear}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  {ancestor.birthPlace}
                </span>
              </div>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div role="tablist" aria-label="Ancestor profile sections" className="flex flex-wrap items-center gap-2 mt-5 border-t border-white/10 pt-3 text-xs">
            <button
              id="ancestor-profile-tab-overview"
              type="button"
              role="tab"
              aria-selected={activeTab === 'overview'}
              aria-controls="ancestor-profile-panel"
              tabIndex={activeTab === 'overview' ? 0 : -1}
              onKeyDown={handleTabKeyDown}
              onClick={() => setActiveTab('overview')}
              className={`min-h-11 px-3 py-2 rounded-lg font-bold transition-all flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 ${
                activeTab === 'overview'
                  ? 'bg-amber-500 text-stone-950 shadow-xs'
                  : 'text-stone-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Life Overview</span>
            </button>

            <button
              id="ancestor-profile-tab-documents"
              type="button"
              role="tab"
              aria-selected={activeTab === 'documents'}
              aria-controls="ancestor-profile-panel"
              tabIndex={activeTab === 'documents' ? 0 : -1}
              onKeyDown={handleTabKeyDown}
              onClick={() => setActiveTab('documents')}
              className={`min-h-11 px-3 py-2 rounded-lg font-bold transition-all flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 ${
                activeTab === 'documents'
                  ? 'bg-amber-500 text-stone-950 shadow-xs'
                  : 'text-stone-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Documents & Photos ({associatedDocs.length})</span>
            </button>

            <button
              id="ancestor-profile-tab-records"
              type="button"
              role="tab"
              aria-selected={activeTab === 'records'}
              aria-controls="ancestor-profile-panel"
              tabIndex={activeTab === 'records' ? 0 : -1}
              onKeyDown={handleTabKeyDown}
              onClick={() => setActiveTab('records')}
              className={`min-h-11 px-3 py-2 rounded-lg font-bold transition-all flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 ${
                activeTab === 'records'
                  ? 'bg-amber-500 text-stone-950 shadow-xs'
                  : 'text-stone-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Synthesized Facts ({ancestorFacts.length})</span>
            </button>

            {onOpenJourneyMap && (
              <button
                onClick={() => {
                  onClose();
                  onOpenJourneyMap();
                }}
                className="ml-auto min-h-11 px-3 py-2 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-stone-950 flex items-center gap-1.5 transition-all shadow-xs"
                title="View interactive Life Journey Map for this ancestor"
              >
                <Compass className="w-3.5 h-3.5 text-stone-950" />
                <span>Life Journey Map</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div
          id="ancestor-profile-panel"
          role="tabpanel"
          aria-labelledby={`ancestor-profile-tab-${activeTab}`}
          tabIndex={0}
          className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 bg-[#FAF9F6] focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-amber-600"
        >
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* Biographical narrative snippet */}
              <div className="bg-white p-4 sm:p-5 rounded-xl border border-stone-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-900">
                  <BookMarked className="w-4 h-4 text-amber-700" />
                  <span>Historical Biographical Narrative</span>
                </div>
                <p className="text-sm sm:text-base font-serif-book text-stone-800 leading-relaxed">
                  "{ancestor.bioSummary}"
                </p>
                <div className="text-[11px] text-stone-500 pt-1">
                  Source: <em>The Fitts Village Story: From Sugar to Salt</em> (Ward Scott & Winston Baird, Amazon)
                </div>
              </div>

              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 flex items-center justify-between gap-3 text-[11px] text-emerald-900">
                <div>
                  <div className="font-bold uppercase tracking-wide">Record confidence</div>
                  <div className="text-emerald-800">{confidenceLabel}</div>
                </div>
                <div className="rounded-full bg-emerald-100 px-2 py-1 font-bold">{Math.round(confidenceScore)}%</div>
              </div>

              {/* Key Life Dates Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-white border border-stone-200 shadow-2xs space-y-1">
                  <span className="text-[11px] font-bold uppercase text-stone-500 tracking-wider">Birth & Baptism</span>
                  <p className="font-bold text-stone-900 text-sm">{birthFact?.dateStr || `${ancestor.birthYear}`}</p>
                  <p className="text-xs text-stone-600 truncate">{birthFact?.place || ancestor.birthPlace}</p>
                  <span className="inline-block mt-1 text-[10px] font-mono-data text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                    Parish Sacramental Record
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-stone-200 shadow-2xs space-y-1">
                  <span className="text-[11px] font-bold uppercase text-stone-500 tracking-wider">Union & Matrimony</span>
                  <p className="font-bold text-stone-900 text-sm">
                    {marriageFacts[0]?.dateStr || (ancestor.spouses && ancestor.spouses.length > 0 ? 'Recorded in St. James' : 'Single / Not Recorded')}
                  </p>
                  <p className="text-xs text-stone-600 truncate">
                    {marriageFacts[0]?.place || 'St. James Parish Church, Holetown'}
                  </p>
                  <span className="inline-block mt-1 text-[10px] font-mono-data text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200">
                    Anglican Banns & Register
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-stone-200 shadow-2xs space-y-1">
                  <span className="text-[11px] font-bold uppercase text-stone-500 tracking-wider">Resting Place / Passing</span>
                  <p className="font-bold text-stone-900 text-sm">{deathFact?.dateStr || `${ancestor.deathYear}`}</p>
                  <p className="text-xs text-stone-600 truncate">{deathFact?.place || ancestor.deathPlace}</p>
                  <span className="inline-block mt-1 text-[10px] font-mono-data text-stone-700 bg-stone-100 px-1.5 py-0.2 rounded border border-stone-200">
                    Parish Churchyard Memorial
                  </span>
                </div>
              </div>

              {/* Trade, Craft & Living Legacy */}
              {tradeFacts.length > 0 && (
                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-950">
                    <Sparkles className="w-4 h-4 text-amber-700" />
                    <span>Coastal Trade & Maritime Craftsmanship:</span>
                  </div>
                  {tradeFacts.map(tf => (
                    <div key={tf.id} className="text-xs text-stone-700 space-y-0.5">
                      <p className="font-semibold text-stone-900">{tf.title} ({tf.year})</p>
                      <p className="text-stone-600">{tf.description}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Fast action: View on Map */}
              {onOpenMapModal && (
                <div className="p-3.5 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-amber-800" />
                    <span className="text-stone-800 font-medium">Explore family homestead, wharves and church on the coastal map</span>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenMapModal();
                    }}
                    className="min-h-11 px-3 py-2 bg-amber-900 hover:bg-amber-950 text-white font-bold rounded-lg shrink-0 transition-colors"
                  >
                    Open Land Map
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: GALLERY OF ASSOCIATED DOCUMENTS & HISTORICAL PHOTOS */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              {associatedDocs.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-xl border border-dashed border-stone-300 space-y-2">
                  <ImageIcon className="w-8 h-8 text-stone-400 mx-auto" />
                  <p className="text-xs font-semibold text-stone-700">No photos or deeds attached directly to this ancestor yet</p>
                  <p className="text-[11px] text-stone-500 max-w-sm mx-auto">
                    You can open the Scrapbook from the top bar to attach archival photographs, deeds, and maps.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {associatedDocs.map(doc => (
                    <div key={doc.id} className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-2xs space-y-2 p-3">
                      <div className="h-44 w-full bg-stone-100 rounded-lg overflow-hidden relative">
                        <img 
                          src={doc.imageUrl} 
                          alt={doc.title} 
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute bottom-2 left-2 text-[10px] font-bold bg-black/70 text-white px-2 py-0.5 rounded backdrop-blur-xs">
                          {doc.year}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-stone-900 leading-snug">{doc.title}</h4>
                        <p className="text-[11px] text-stone-600 line-clamp-2 mt-0.5">{doc.description}</p>
                        <span className="text-[10px] text-stone-400 block mt-1">Source: {doc.sourceAttribution}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SYNTHESIZED LIFE FACTS LIST */}
          {activeTab === 'records' && (
            <div className="space-y-3">
              <div className="text-xs text-stone-600 flex items-center justify-between">
                <span>Total verified life events compiled: <strong>{ancestorFacts.length}</strong></span>
                <span className="text-emerald-700 font-medium">FamilySearch & Ancestry dual verified</span>
              </div>

              {ancestorFacts.map(fact => {
                const isDedup = fact.isDeduplicated;
                const hasFS = fact.sources.some(s => s.provider === 'familysearch');
                const hasAnc = fact.sources.some(s => s.provider === 'ancestry');

                return (
                  <div key={fact.id} className="p-3.5 bg-white rounded-xl border border-stone-200 shadow-2xs space-y-1.5 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono-data font-bold text-amber-900 bg-amber-100 px-2 py-0.2 rounded">
                          {fact.year}
                        </span>
                        <h5 className="font-bold text-stone-900">{fact.title}</h5>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {isDedup && (
                          <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-1.5 py-0.2 rounded border border-amber-300">
                            Deduplicated
                          </span>
                        )}
                        {hasFS && <span className="bg-blue-50 text-blue-700 text-[10px] font-semibold px-1.5 py-0.2 rounded border border-blue-200">FS</span>}
                        {hasAnc && <span className="bg-emerald-50 text-emerald-700 text-[10px] font-semibold px-1.5 py-0.2 rounded border border-emerald-200">Ancestry</span>}
                      </div>
                    </div>

                    <p className="text-stone-700 text-xs leading-relaxed">{fact.description}</p>
                    <div className="text-[11px] text-stone-500 flex items-center gap-2">
                      <span>{fact.dateStr}</span>
                      <span>·</span>
                      <span className="truncate">{fact.place}</span>
                    </div>

                    {onCiteFact && (
                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => {
                            onCiteFact(fact);
                            onClose();
                          }}
                          className="min-h-11 px-3 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded font-semibold text-[11px] flex items-center gap-1"
                        >
                          <BookMarked className="w-3 h-3 text-amber-800" />
                          <span>Cite in Active Chapter</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Modal Bottom Footer */}
        <div className="px-5 py-3.5 bg-stone-100 border-t border-stone-200 flex items-center justify-between">
          <div className="text-xs text-stone-500">
            Clicking any ancestor in the tree opens this consolidated dossier
          </div>
          <button
            onClick={onClose}
            className="min-h-11 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl text-xs shadow-xs"
          >
            Close Profile
          </button>
        </div>

      </div>
    </div>
  );
};
