import React, { useState } from 'react';
import { ManuscriptChapter, CitationFootnote, Ancestor } from '../types/genealogy';
import { BookOpen, Printer, Download, Check, X, Sparkles, FileText, ChevronRight, Eye } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  documentTitle: string;
  chapters: ManuscriptChapter[];
  citations: CitationFootnote[];
  ancestors: Ancestor[];
}

export const AmazonKDPExportModal: React.FC<Props> = ({
  isOpen,
  onClose,
  documentTitle,
  chapters,
  citations,
  ancestors
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'kdp-specs' | 'front-matter'>('preview');
  const [dedication, setDedication] = useState(
    'Dedicated to the boatbuilders, seine-haulers, and mothers of Fitts Village, St. James, Barbados—whose hands shaped our hulls and whose courage carried our family from sugar to the saltwater sea.'
  );
  const [copiedNotification, setCopiedNotification] = useState(false);

  if (!isOpen) return null;

  const totalWords = chapters.reduce((sum, c) => sum + (c.wordCount || 0), 0);
  const estimatedPages = Math.max(12, Math.ceil(totalWords / 280) + 6); // ~280 words per 6"x9" book page + front matter

  const handlePrintKDP = () => {
    window.print();
  };

  const handleDownloadKDPManuscript = () => {
    let fullText = `# ${documentTitle}\nAuthor: Ward Scott\n\n`;
    fullText += `## DEDICATION\n${dedication}\n\n`;
    fullText += `## TABLE OF CONTENTS\n`;
    chapters.forEach((ch, idx) => {
      fullText += `${idx + 1}. ${ch.title} (${ch.wordCount || 0} words)\n`;
    });
    fullText += `\n---\n\n`;
    chapters.forEach((ch, idx) => {
      fullText += `## ${ch.title}\n${ch.subtitle ? `*${ch.subtitle}*\n\n` : '\n'}`;
      // Clean HTML to text
      const cleanText = ch.contentHtml
        .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '\n### $1\n')
        .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
        .replace(/<[^>]+>/g, '');
      fullText += cleanText + '\n\n';
    });

    fullText += `\n## ARCHIVAL SOURCES & GENEALOGY CITATIONS\n\n`;
    citations.forEach(c => {
      fullText += `[${c.number}] ${c.ancestorName} (${c.year}) - ${c.eventTitle}: ${c.fullCitation}\nSource URL: ${c.sourceUrl}\n\n`;
    });

    const blob = new Blob([fullText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Echoes_of_Fitts_Village_Ward_Scott_KDP_Manuscript.md`;
    a.click();
    URL.revokeObjectURL(url);

    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs">
      <div className="bg-white max-w-4xl w-full rounded-2xl shadow-2xl border border-stone-300 flex flex-col max-h-[94vh] overflow-hidden text-stone-900 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-amber-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-800 text-white flex items-center justify-center shadow-sm">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold font-serif-book text-stone-900 text-lg">
                Amazon KDP 6" × 9" Paperback Exporter
              </h3>
              <p className="text-xs text-stone-600">
                Print-ready trade paperback format tailored for Amazon Kindle Direct Publishing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-bar Tabs */}
        <div className="px-5 py-2 bg-stone-100 border-b border-stone-200 flex items-center justify-between text-xs">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'preview' ? 'bg-white shadow-2xs text-stone-900 border border-stone-200' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" /> Book Page Preview
            </button>
            <button
              onClick={() => setActiveTab('front-matter')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'front-matter' ? 'bg-white shadow-2xs text-stone-900 border border-stone-200' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> Dedication & Specs
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-stone-600 font-mono text-[11px]">
            <span>6" × 9" Trade Paperback</span>
            <span>·</span>
            <span>~{estimatedPages} Pages</span>
            <span>·</span>
            <span>{citations.length} Verified Citations</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 bg-stone-50">
          
          {activeTab === 'preview' ? (
            <div className="max-w-xl mx-auto space-y-6">
              
              {/* Simulated 6"x9" Book Page in Classical Trade Typography */}
              <div className="bg-white rounded-xl shadow-lg border border-stone-300 p-8 sm:p-10 text-stone-900 space-y-6 aspect-[6/9] min-h-[580px] font-serif-book relative select-text">
                
                {/* Running Header */}
                <div className="border-b border-stone-200 pb-2 flex justify-between items-center text-[11px] text-stone-500 uppercase tracking-widest font-sans-ui">
                  <span>Echoes of Fitts Village</span>
                  <span>Ward Scott</span>
                </div>

                {/* Page Title & Chapter Header */}
                <div className="text-center pt-4 space-y-1">
                  <span className="text-[11px] uppercase tracking-widest text-amber-800 font-sans-ui font-semibold">
                    {chapters[0]?.title.split(':')[0] || 'Chapter 1'}
                  </span>
                  <h2 className="text-xl font-bold font-serif-book text-stone-900">
                    {chapters[0]?.title.split(':')[1]?.trim() || chapters[0]?.title}
                  </h2>
                  {chapters[0]?.subtitle && (
                    <p className="text-xs italic text-stone-600 pt-1">
                      {chapters[0]?.subtitle}
                    </p>
                  )}
                </div>

                {/* Body Content with simulated Book Typography */}
                <div 
                  className="text-xs leading-relaxed text-stone-800 space-y-3 pt-2"
                  dangerouslySetInnerHTML={{ __html: chapters[0]?.contentHtml || '' }}
                />

                {/* Running Footer Page Number */}
                <div className="absolute bottom-6 left-0 right-0 text-center text-xs text-stone-400 font-mono">
                  — 1 —
                </div>
              </div>

              <div className="text-center text-xs text-stone-500 flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Formatted to standard Amazon KDP margins: 0.75" gutter margin and 0.5" outside margin</span>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto space-y-5 bg-white p-6 rounded-2xl border border-stone-200 text-xs">
              <div>
                <h4 className="font-bold text-sm text-stone-900 mb-1">Book Dedication</h4>
                <p className="text-stone-500 mb-2">This dedication will appear immediately following the title page in grandfather's book:</p>
                <textarea
                  value={dedication}
                  onChange={e => setDedication(e.target.value)}
                  rows={4}
                  className="w-full p-3 border border-stone-300 rounded-xl bg-stone-50 text-stone-900 text-xs leading-relaxed focus:bg-white"
                />
              </div>

              <div className="border-t border-stone-200 pt-4 space-y-3">
                <h4 className="font-bold text-sm text-stone-900">Amazon KDP Formatting Specifications</h4>
                <div className="grid grid-cols-2 gap-3 text-stone-700">
                  <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                    <span className="font-semibold block text-stone-900">Trim Size</span>
                    <span>6" × 9" (15.24 × 22.86 cm) Standard Trade Paperback</span>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                    <span className="font-semibold block text-stone-900">Paper Type</span>
                    <span>Cream Paper (Recommended for Memoirs & History)</span>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                    <span className="font-semibold block text-stone-900">Interior Color</span>
                    <span>Black & White with High-Contrast Photo Inserts</span>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                    <span className="font-semibold block text-stone-900">Cover Finish</span>
                    <span>Matte or Glossy Paperback</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-stone-200 pt-4 space-y-2">
                <h4 className="font-bold text-sm text-stone-900">Table of Contents</h4>
                <div className="space-y-1.5 font-serif-book">
                  {chapters.map((ch, idx) => (
                    <div key={ch.id} className="flex justify-between items-center py-1 border-b border-stone-100">
                      <span>{idx + 1}. {ch.title}</span>
                      <span className="text-stone-500 font-mono text-[11px]">{ch.wordCount || 0} words</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-200 rounded-lg"
            >
              Close
            </button>
            {copiedNotification && (
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Manuscript Downloaded!
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadKDPManuscript}
              className="flex items-center gap-1.5 px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
              title="Download manuscript formatted for Amazon KDP upload"
            >
              <Download className="w-4 h-4 text-amber-300" />
              <span>Download for Amazon KDP</span>
            </button>

            <button
              onClick={handlePrintKDP}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
              title="Print 6x9 trade paperback pages or save to PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Print 6" × 9" Pages (PDF)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
