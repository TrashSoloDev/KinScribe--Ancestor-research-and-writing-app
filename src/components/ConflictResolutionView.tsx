import React, { useState } from 'react';
import { RecordConflict, ConflictingRecordOption, Ancestor, TimelineFact } from '../types/genealogy';
import { 
  Check, 
  Scale, 
  AlertTriangle, 
  Calendar, 
  MapPin, 
  ExternalLink, 
  BookMarked, 
  FileText, 
  RotateCcw, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Columns, 
  Rows,
  HelpCircle,
  Clock,
  ArrowRight
} from 'lucide-react';

interface Props {
  conflicts: RecordConflict[];
  ancestors: Ancestor[];
  selectedAncestorId: string;
  onSelectPrimaryRecord: (conflictId: string, primaryChoice: 'recordA' | 'recordB', notes?: string) => void;
  onCiteRecord: (record: ConflictingRecordOption, ancestorName: string) => void;
  fontSizeScale: 'standard' | 'large' | 'xlarge';
}

export const ConflictResolutionView: React.FC<Props> = ({
  conflicts,
  ancestors,
  selectedAncestorId,
  onSelectPrimaryRecord,
  onCiteRecord,
  fontSizeScale
}) => {
  // Mobile phone switcher for single-record inspection vs side-by-side
  const [mobileActiveRecords, setMobileActiveRecords] = useState<Record<string, 'recordA' | 'recordB'>>({});
  // Expandable field comparison matrix toggle
  const [expandedComparisons, setExpandedComparisons] = useState<Record<string, boolean>>({});
  // User filter: show all conflicts or only for selected ancestor
  const [filterByAncestor, setFilterByAncestor] = useState<boolean>(true);
  const [filterPendingOnly, setFilterPendingOnly] = useState<boolean>(false);
  // Feedback toast for action
  const [actionToast, setActionToast] = useState<string | null>(null);

  // Selected ancestor info
  const selectedAncestor = ancestors.find(a => a.id === selectedAncestorId);

  // Filtered conflicts list
  const filteredConflicts = conflicts.filter(c => {
    if (filterByAncestor && selectedAncestorId && c.ancestorId !== selectedAncestorId) {
      return false;
    }
    if (filterPendingOnly && c.status === 'resolved') {
      return false;
    }
    return true;
  });

  // Calculate resolution stats
  const totalCount = conflicts.length;
  const resolvedCount = conflicts.filter(c => c.status === 'resolved').length;
  const percentResolved = Math.round((resolvedCount / Math.max(totalCount, 1)) * 100);

  const handleSelectPrimary = (conflictId: string, choice: 'recordA' | 'recordB') => {
    const conflict = conflicts.find(c => c.id === conflictId);
    const chosenRecord = choice === 'recordA' ? conflict?.recordA : conflict?.recordB;
    const providerName = chosenRecord?.provider === 'familysearch' ? 'FamilySearch' : 'Ancestry.com';

    onSelectPrimaryRecord(conflictId, choice);
    setActionToast(`✓ Primary timeline record updated: ${providerName} (${chosenRecord?.dateStr || ''})`);
    setTimeout(() => setActionToast(null), 3000);
  };

  const toggleMobileRecord = (conflictId: string, choice: 'recordA' | 'recordB') => {
    setMobileActiveRecords(prev => ({
      ...prev,
      [conflictId]: choice
    }));
  };

  const toggleComparisonMatrix = (conflictId: string) => {
    setExpandedComparisons(prev => ({
      ...prev,
      [conflictId]: !prev[conflictId]
    }));
  };

  const scaleClass = 
    fontSizeScale === 'xlarge' ? 'text-lg' :
    fontSizeScale === 'large' ? 'text-base' : 'text-sm';

  return (
    <div className="space-y-6">
      
      {/* 1. ANDROID MATERIAL 3 CONFLICT RESOLUTION HEADER */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 flex items-center justify-center shrink-0">
              <Scale className="w-5 h-5 text-amber-800" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif-book font-bold text-stone-900 text-lg sm:text-xl">
                  Genealogical Conflict Resolution Studio
                </h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  Android App Mode
                </span>
              </div>
              <p className="text-xs text-stone-600 mt-0.5">
                Compare conflicting records between FamilySearch and Ancestry side-by-side. Choose the authoritative primary record for grandfather's timeline.
              </p>
            </div>
          </div>

          {/* Quick Progress Indicator */}
          <div className="flex items-center gap-3 bg-stone-50 border border-stone-200 px-3.5 py-2 rounded-xl shrink-0">
            <div className="text-right">
              <div className="text-xs font-bold text-stone-800">
                {resolvedCount} of {totalCount} Resolved
              </div>
              <div className="text-[10px] text-stone-500 font-mono-data">
                {percentResolved}% Timeline Verified
              </div>
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-stone-200 flex items-center justify-center bg-white">
              <span className="text-xs font-bold text-amber-800 font-mono-data">
                {percentResolved}%
              </span>
            </div>
          </div>
        </div>

        {/* Filters and Scope bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter by selected ancestor button */}
            {selectedAncestor && (
              <button
                onClick={() => setFilterByAncestor(!filterByAncestor)}
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 border transition-all ${
                  filterByAncestor
                    ? 'bg-amber-800 text-white border-amber-900 shadow-2xs'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border-stone-300'
                }`}
              >
                <span>For {selectedAncestor.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono-data ${filterByAncestor ? 'bg-amber-950 text-amber-200' : 'bg-stone-200 text-stone-700'}`}>
                  {conflicts.filter(c => c.ancestorId === selectedAncestor.id).length}
                </span>
              </button>
            )}

            {/* Show all conflicts button */}
            <button
              onClick={() => setFilterByAncestor(false)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all border ${
                !filterByAncestor
                  ? 'bg-stone-900 text-white border-stone-900 shadow-2xs'
                  : 'bg-white text-stone-700 hover:bg-stone-100 border-stone-300'
              }`}
            >
              All Ancestors ({totalCount})
            </button>

            {/* Pending Only Toggle */}
            <button
              onClick={() => setFilterPendingOnly(!filterPendingOnly)}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 border transition-all ${
                filterPendingOnly
                  ? 'bg-amber-100 border-amber-400 text-amber-950 font-bold'
                  : 'bg-white border-stone-300 text-stone-600 hover:bg-stone-50'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
              <span>Pending Review Only</span>
              <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded-full font-mono-data font-bold">
                {conflicts.filter(c => c.status === 'pending').length}
              </span>
            </button>
          </div>

          <span className="text-stone-500 text-[11px]">
            Tapping "Select Primary" updates timeline chronologies instantly
          </span>
        </div>
      </div>

      {/* FLOATING ACTION TOAST */}
      {actionToast && (
        <div className="fixed bottom-20 md:bottom-8 right-6 z-50 bg-stone-900 text-amber-200 px-4 py-2.5 rounded-xl shadow-2xl border border-stone-700 flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionToast}</span>
        </div>
      )}

      {/* 2. CONFLICT LIST */}
      {filteredConflicts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-stone-200 p-8 shadow-2xs space-y-3">
          <Check className="w-10 h-10 text-emerald-600 mx-auto" />
          <h4 className="font-bold text-stone-900 text-base">
            No Unresolved Conflicts Found
          </h4>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            {filterPendingOnly
              ? 'All genealogical records for this filter have been reviewed and verified with an authoritative primary selection.'
              : 'No discrepancies detected between FamilySearch and Ancestry for this ancestor.'}
          </p>
          <button
            onClick={() => {
              setFilterByAncestor(false);
              setFilterPendingOnly(false);
            }}
            className="px-4 py-2 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-xl transition-colors"
          >
            Show All {totalCount} Ancestral Records
          </button>
        </div>
      ) : (
        filteredConflicts.map((conflict, cIdx) => {
          const isRecordA = conflict.selectedPrimaryId === 'recordA';
          const isRecordB = conflict.selectedPrimaryId === 'recordB';
          const mobileActive = mobileActiveRecords[conflict.id] || conflict.selectedPrimaryId || 'recordA';
          const isMatrixExpanded = Boolean(expandedComparisons[conflict.id]);

          return (
            <div
              key={conflict.id}
              className={`bg-white rounded-2xl border shadow-xs transition-all overflow-hidden ${
                conflict.status === 'resolved'
                  ? 'border-stone-200'
                  : 'border-amber-300 ring-1 ring-amber-200'
              }`}
            >
              {/* Conflict Header */}
              <div className="p-4 sm:p-5 bg-stone-50/80 border-b border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="w-6 h-6 rounded-full bg-amber-800 text-white font-bold text-xs flex items-center justify-center font-mono-data shrink-0">
                      #{cIdx + 1}
                    </span>
                    <h4 className="font-serif-book font-bold text-stone-900 text-base sm:text-lg">
                      {conflict.fieldInConflict}
                    </h4>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-200 text-stone-800">
                      {conflict.ancestorName}
                    </span>
                    {conflict.status === 'resolved' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-300">
                        <Check className="w-3 h-3 text-emerald-600" /> Primary Selected
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                        <AlertTriangle className="w-3 h-3 text-amber-700" /> Discrepancy Needs Decision
                      </span>
                    )}
                  </div>

                  {/* Summary of difference */}
                  <p className="text-xs text-amber-950 font-medium pl-8">
                    <span className="font-bold">Archival Discrepancy:</span> {conflict.discrepancySummary}
                  </p>
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-2 shrink-0 pl-8 md:pl-0">
                  <button
                    onClick={() => toggleComparisonMatrix(conflict.id)}
                    className="px-2.5 py-1.5 text-xs text-stone-700 bg-white hover:bg-stone-100 border border-stone-300 rounded-lg flex items-center gap-1.5 transition-colors font-medium"
                    title="Toggle field-by-field diff comparison table"
                  >
                    <Columns className="w-3.5 h-3.5 text-amber-700" />
                    <span>{isMatrixExpanded ? 'Hide Field Diff' : 'Compare Field Diff'}</span>
                    {isMatrixExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              {/* MOBILE SEGMENTED SELECTOR (for small smartphone viewports so user doesn't get cramped) */}
              <div className="block sm:hidden px-4 pt-3 pb-1 border-b border-stone-100 bg-stone-50/50">
                <div className="text-[11px] font-semibold text-stone-500 mb-1.5 flex items-center justify-between">
                  <span>Switch Record View (Smartphone):</span>
                  <span className="text-amber-800 font-bold">
                    {mobileActive === 'recordA' ? 'Viewing FamilySearch' : 'Viewing Ancestry'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 bg-stone-200/80 p-1 rounded-xl">
                  <button
                    onClick={() => toggleMobileRecord(conflict.id, 'recordA')}
                    className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                      mobileActive === 'recordA'
                        ? 'bg-white text-blue-900 shadow-xs'
                        : 'text-stone-600'
                    }`}
                  >
                    <span className="w-4 h-4 rounded bg-[#0076CE] text-white text-[9px] font-bold flex items-center justify-center">FS</span>
                    <span>FamilySearch {isRecordA && '★'}</span>
                  </button>

                  <button
                    onClick={() => toggleMobileRecord(conflict.id, 'recordB')}
                    className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                      mobileActive === 'recordB'
                        ? 'bg-white text-emerald-900 shadow-xs'
                        : 'text-stone-600'
                    }`}
                  >
                    <span className="w-4 h-4 rounded bg-[#1D7044] text-white text-[9px] font-bold flex items-center justify-center">A</span>
                    <span>Ancestry {isRecordB && '★'}</span>
                  </button>
                </div>
              </div>

              {/* SIDE-BY-SIDE RECORD COMPARISON CONTAINER */}
              <div className="p-4 sm:p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                  
                  {/* ===================== RECORD A (e.g. FamilySearch) ===================== */}
                  <div
                    className={`rounded-2xl border p-4 sm:p-5 transition-all flex flex-col justify-between ${
                      /* In mobile phone view, respect mobile tab toggle */
                      mobileActive !== 'recordA' ? 'hidden sm:flex' : 'flex'
                    } ${
                      isRecordA
                        ? 'bg-blue-50/20 border-blue-400 ring-2 ring-blue-300/60 shadow-sm'
                        : 'bg-stone-50/60 border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="space-y-3.5">
                      {/* Provider Header */}
                      <div className="flex items-start justify-between gap-2 border-b border-stone-200/80 pb-3">
                        <div className="flex items-center gap-2">
                          <span className={`w-6 h-6 rounded-md font-bold text-xs flex items-center justify-center text-white ${
                            conflict.recordA.provider === 'familysearch' ? 'bg-[#0076CE]' : 'bg-[#1D7044]'
                          }`}>
                            {conflict.recordA.provider === 'familysearch' ? 'FS' : 'A'}
                          </span>
                          <div>
                            <span className="text-xs font-bold text-stone-900">
                              {conflict.recordA.provider === 'familysearch' ? 'FamilySearch.org' : 'Ancestry.com'}
                            </span>
                            <div className="text-[10px] text-stone-500 font-medium">
                              {conflict.recordA.recordType}
                            </div>
                          </div>
                        </div>

                        {/* Authority & Status pill */}
                        {isRecordA ? (
                          <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-700 text-white flex items-center gap-1 shadow-2xs">
                            <Check className="w-3.5 h-3.5 text-white" /> Primary on Timeline
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-stone-200 text-stone-600">
                            Alternate Evidence
                          </span>
                        )}
                      </div>

                      {/* Source Title & Collection */}
                      <div>
                        <h5 className="font-semibold text-stone-900 text-sm">
                          {conflict.recordA.sourceTitle}
                        </h5>
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          Collection: {conflict.recordA.collection}
                        </p>
                      </div>

                      {/* Key Discrepancy Highlight Box */}
                      <div className="bg-white border border-stone-200/90 rounded-xl p-3 space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-[10px] text-stone-500 uppercase font-semibold block">Date in Record:</span>
                            <span className="font-mono-data font-bold text-stone-900 text-sm">
                              {conflict.recordA.dateStr}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-stone-500 uppercase font-semibold block">Calculated Year:</span>
                            <span className="font-mono-data font-bold text-stone-900 text-sm">
                              {conflict.recordA.year}
                            </span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-stone-100">
                          <span className="text-[10px] text-stone-500 uppercase font-semibold block">Location / Jurisdiction:</span>
                          <span className="text-xs font-medium text-stone-800 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                            {conflict.recordA.place}
                          </span>
                        </div>
                      </div>

                      {/* Narrative Description & Transcribed Facts */}
                      <p className={`text-stone-700 leading-relaxed ${scaleClass}`}>
                        {conflict.recordA.description}
                      </p>

                      {/* Archival Details Checklist */}
                      {conflict.recordA.details && conflict.recordA.details.length > 0 && (
                        <div className="space-y-1 pt-1">
                          <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                            Document Details & Certificates:
                          </span>
                          <div className="space-y-1 text-xs text-stone-600">
                            {conflict.recordA.details.map((detail, idx) => (
                              <div key={idx} className="flex items-start gap-1.5">
                                <span className="text-blue-600 font-bold">•</span>
                                <span>{detail}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Citation text */}
                      <div className="bg-stone-100/80 rounded-lg p-2.5 text-[11px] font-mono-data text-stone-600 leading-tight">
                        <span className="font-bold text-stone-700 block mb-0.5 font-sans-ui text-[10px] uppercase">Official Citation:</span>
                        {conflict.recordA.citation}
                      </div>
                    </div>

                    {/* Bottom Primary Selection Button */}
                    <div className="pt-4 mt-4 border-t border-stone-200/80 flex items-center justify-between gap-2">
                      <a
                        href={conflict.recordA.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 hover:underline"
                        title="Verify record directly in external archive"
                      >
                        <span>Verify Record</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>

                      <button
                        onClick={() => handleSelectPrimary(conflict.id, 'recordA')}
                        className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs active:scale-[0.98] ${
                          isRecordA
                            ? 'bg-blue-700 text-white ring-2 ring-blue-500/40 cursor-default'
                            : 'bg-stone-900 hover:bg-stone-800 text-amber-200'
                        }`}
                      >
                        {isRecordA ? (
                          <>
                            <Check className="w-3.5 h-3.5" /> Primary Selected
                          </>
                        ) : (
                          <>
                            <span>Set as Primary for Timeline</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* ===================== RECORD B (e.g. Ancestry) ===================== */}
                  <div
                    className={`rounded-2xl border p-4 sm:p-5 transition-all flex flex-col justify-between ${
                      /* In mobile phone view, respect mobile tab toggle */
                      mobileActive !== 'recordB' ? 'hidden sm:flex' : 'flex'
                    } ${
                      isRecordB
                        ? 'bg-emerald-50/20 border-emerald-400 ring-2 ring-emerald-300/60 shadow-sm'
                        : 'bg-stone-50/60 border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="space-y-3.5">
                      {/* Provider Header */}
                      <div className="flex items-start justify-between gap-2 border-b border-stone-200/80 pb-3">
                        <div className="flex items-center gap-2">
                          <span className={`w-6 h-6 rounded-md font-bold text-xs flex items-center justify-center text-white ${
                            conflict.recordB.provider === 'ancestry' ? 'bg-[#1D7044]' : 'bg-[#0076CE]'
                          }`}>
                            {conflict.recordB.provider === 'ancestry' ? 'A' : 'FS'}
                          </span>
                          <div>
                            <span className="text-xs font-bold text-stone-900">
                              {conflict.recordB.provider === 'ancestry' ? 'Ancestry.com' : 'FamilySearch.org'}
                            </span>
                            <div className="text-[10px] text-stone-500 font-medium">
                              {conflict.recordB.recordType}
                            </div>
                          </div>
                        </div>

                        {/* Authority & Status pill */}
                        {isRecordB ? (
                          <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-700 text-white flex items-center gap-1 shadow-2xs">
                            <Check className="w-3.5 h-3.5 text-white" /> Primary on Timeline
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-stone-200 text-stone-600">
                            Alternate Evidence
                          </span>
                        )}
                      </div>

                      {/* Source Title & Collection */}
                      <div>
                        <h5 className="font-semibold text-stone-900 text-sm">
                          {conflict.recordB.sourceTitle}
                        </h5>
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          Collection: {conflict.recordB.collection}
                        </p>
                      </div>

                      {/* Key Discrepancy Highlight Box */}
                      <div className="bg-white border border-stone-200/90 rounded-xl p-3 space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-[10px] text-stone-500 uppercase font-semibold block">Date in Record:</span>
                            <span className="font-mono-data font-bold text-stone-900 text-sm">
                              {conflict.recordB.dateStr}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-stone-500 uppercase font-semibold block">Calculated Year:</span>
                            <span className="font-mono-data font-bold text-stone-900 text-sm">
                              {conflict.recordB.year}
                            </span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-stone-100">
                          <span className="text-[10px] text-stone-500 uppercase font-semibold block">Location / Jurisdiction:</span>
                          <span className="text-xs font-medium text-stone-800 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                            {conflict.recordB.place}
                          </span>
                        </div>
                      </div>

                      {/* Narrative Description & Transcribed Facts */}
                      <p className={`text-stone-700 leading-relaxed ${scaleClass}`}>
                        {conflict.recordB.description}
                      </p>

                      {/* Archival Details Checklist */}
                      {conflict.recordB.details && conflict.recordB.details.length > 0 && (
                        <div className="space-y-1 pt-1">
                          <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                            Document Details & Certificates:
                          </span>
                          <div className="space-y-1 text-xs text-stone-600">
                            {conflict.recordB.details.map((detail, idx) => (
                              <div key={idx} className="flex items-start gap-1.5">
                                <span className="text-emerald-600 font-bold">•</span>
                                <span>{detail}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Citation text */}
                      <div className="bg-stone-100/80 rounded-lg p-2.5 text-[11px] font-mono-data text-stone-600 leading-tight">
                        <span className="font-bold text-stone-700 block mb-0.5 font-sans-ui text-[10px] uppercase">Official Citation:</span>
                        {conflict.recordB.citation}
                      </div>
                    </div>

                    {/* Bottom Primary Selection Button */}
                    <div className="pt-4 mt-4 border-t border-stone-200/80 flex items-center justify-between gap-2">
                      <a
                        href={conflict.recordB.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 hover:underline"
                        title="Verify record directly in external archive"
                      >
                        <span>Verify Record</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>

                      <button
                        onClick={() => handleSelectPrimary(conflict.id, 'recordB')}
                        className={`px-4 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs active:scale-[0.98] ${
                          isRecordB
                            ? 'bg-emerald-700 text-white ring-2 ring-emerald-500/40 cursor-default'
                            : 'bg-stone-900 hover:bg-stone-800 text-amber-200'
                        }`}
                      >
                        {isRecordB ? (
                          <>
                            <Check className="w-3.5 h-3.5" /> Primary Selected
                          </>
                        ) : (
                          <>
                            <span>Set as Primary for Timeline</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                </div>

                {/* EXPANDABLE FIELD-BY-FIELD COMPARISON MATRIX */}
                {isMatrixExpanded && (
                  <div className="mt-4 pt-4 border-t border-stone-200 overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-stone-200 text-stone-500">
                          <th className="pb-2 font-semibold">Field</th>
                          <th className="pb-2 font-semibold text-blue-900">Record A (FamilySearch)</th>
                          <th className="pb-2 font-semibold text-emerald-900">Record B (Ancestry)</th>
                          <th className="pb-2 font-semibold">Discrepancy Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        <tr>
                          <td className="py-2 font-medium text-stone-700">Event Date</td>
                          <td className="py-2 font-mono-data text-stone-900">{conflict.recordA.dateStr}</td>
                          <td className="py-2 font-mono-data text-stone-900">{conflict.recordB.dateStr}</td>
                          <td className="py-2">
                            {conflict.recordA.dateStr === conflict.recordB.dateStr ? (
                              <span className="text-emerald-700 font-semibold">✓ Match</span>
                            ) : (
                              <span className="text-amber-800 font-semibold">⚠️ Mismatch</span>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 font-medium text-stone-700">Event Year</td>
                          <td className="py-2 font-mono-data text-stone-900">{conflict.recordA.year}</td>
                          <td className="py-2 font-mono-data text-stone-900">{conflict.recordB.year}</td>
                          <td className="py-2">
                            {conflict.recordA.year === conflict.recordB.year ? (
                              <span className="text-emerald-700 font-semibold">✓ Exact Year</span>
                            ) : (
                              <span className="text-red-700 font-semibold">⚠️ {Math.abs(conflict.recordA.year - conflict.recordB.year)} Year Discrepancy</span>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 font-medium text-stone-700">Location</td>
                          <td className="py-2 text-stone-900">{conflict.recordA.place}</td>
                          <td className="py-2 text-stone-900">{conflict.recordB.place}</td>
                          <td className="py-2 text-stone-500">
                            {conflict.recordA.place.toLowerCase() === conflict.recordB.place.toLowerCase() ? (
                              <span className="text-emerald-700 font-semibold">✓ Match</span>
                            ) : (
                              <span className="text-amber-800 font-semibold">⚠️ Jurisdictional Variant</span>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 font-medium text-stone-700">Authority Weight</td>
                          <td className="py-2 text-stone-900">{conflict.recordA.confidence === 'primary' ? 'Primary Registry' : 'Secondary'}</td>
                          <td className="py-2 text-stone-900">{conflict.recordB.confidence === 'primary' ? 'Primary Registry' : 'Secondary'}</td>
                          <td className="py-2 text-stone-600">
                            {conflict.recordA.confidence === 'primary' && conflict.recordB.confidence !== 'primary' ? (
                              <span className="text-blue-700 font-semibold">Record A Recommended</span>
                            ) : conflict.recordB.confidence === 'primary' && conflict.recordA.confidence !== 'primary' ? (
                              <span className="text-emerald-700 font-semibold">Record B Recommended</span>
                            ) : (
                              <span>Equal Weight</span>
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {/* RESOLUTION RATIONALE & CITATION ACTION FOOTER */}
                <div className="mt-4 pt-3.5 border-t border-stone-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-stone-50/70 p-3 rounded-xl">
                  <div className="flex-1 space-y-1">
                    <span className="font-semibold text-stone-800 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-amber-700" />
                      Resolution Rationale:
                    </span>
                    <input
                      type="text"
                      defaultValue={conflict.resolutionNotes || ''}
                      placeholder="Add note on why this record was selected as primary (e.g., parish baptism register is primary authority)..."
                      onBlur={(e) => {
                        onSelectPrimaryRecord(conflict.id, conflict.selectedPrimaryId, e.target.value);
                      }}
                      className="w-full text-xs p-1.5 bg-white border border-stone-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500 text-stone-800"
                    />
                  </div>

                  {/* Immediate Book Citation Button */}
                  <div className="shrink-0 flex items-center gap-2 self-end sm:self-auto pt-1 sm:pt-0">
                    <button
                      onClick={() => {
                        const chosen = isRecordA ? conflict.recordA : conflict.recordB;
                        onCiteRecord(chosen, conflict.ancestorName);
                        setActionToast(`Inserted citation for "${chosen.sourceTitle}" into active manuscript chapter!`);
                        setTimeout(() => setActionToast(null), 3500);
                      }}
                      className="px-3.5 py-2 text-xs font-bold rounded-xl bg-amber-200 hover:bg-amber-300 text-amber-950 border border-amber-300 flex items-center gap-1.5 shadow-2xs transition-colors"
                      title="Cite this resolved primary record in your family history book"
                    >
                      <BookMarked className="w-3.5 h-3.5 text-amber-800" />
                      <span>Cite Primary in Book</span>
                    </button>
                  </div>
                </div>

              </div>

            </div>
          );
        })
      )}

    </div>
  );
};
