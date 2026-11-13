import React, { useState, useRef } from 'react';
import { 
  FileDown, 
  Printer, 
  X, 
  BookMarked, 
  Check, 
  ExternalLink,
  Settings2,
  FileCode,
  FileText,
  Eye,
  Sliders,
  Sparkles
} from 'lucide-react';
import { ManuscriptChapter, CitationFootnote } from '../types/genealogy';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  chapter: ManuscriptChapter;
  documentTitle: string;
  citations: CitationFootnote[];
}

export const ChapterPdfExportModal: React.FC<Props> = ({
  isOpen,
  onClose,
  chapter,
  documentTitle,
  citations
}) => {
  const [paperFormat, setPaperFormat] = useState<'letter' | 'a4' | 'trade'>('letter');
  const [includeCitations, setIncludeCitations] = useState(true);
  const [fontSizePt, setFontSizePt] = useState(12);
  const [lineSpacing, setLineSpacing] = useState<'1.5' | '1.75' | '2.0'>('1.75');
  const [includeHeaderFolio, setIncludeHeaderFolio] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // Clean HTML: ensure safe display of chapter content
  const contentHtml = chapter.contentHtml || '<p class="text-stone-400 italic">No content in this chapter yet.</p>';
  const wordCount = chapter.wordCount || 0;
  const estimatedPages = Math.max(1, Math.ceil(wordCount / 280));

  // Trigger browser print dialog with PDF save instructions
  const handlePrintToPdf = () => {
    // Inject a special print wrapper class or trigger standard print
    window.print();
  };

  // Download standalone printable HTML file that can be opened and printed anywhere
  const handleDownloadHtmlFile = () => {
    const standaloneHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${documentTitle} - ${chapter.title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400;1,600&family=Plus+Jakarta+Sans:wght@400;600&display=swap');
    
    @page {
      size: ${paperFormat === 'letter' ? 'letter' : paperFormat === 'a4' ? 'A4' : '6in 9in'};
      margin: 1in;
      @bottom-center {
        content: counter(page);
        font-family: 'Plus Jakarta Sans', sans-serif;
        font-size: 9pt;
        color: #78716c;
      }
    }
    
    body {
      font-family: 'Lora', Georgia, 'Times New Roman', serif;
      font-size: ${fontSizePt}pt;
      line-height: ${lineSpacing};
      color: #1c1917;
      background: #ffffff;
      max-width: 7.2in;
      margin: 0 auto;
      padding: 0.5in 0;
    }
    
    .doc-header {
      text-align: center;
      margin-bottom: 2.5rem;
      padding-bottom: 1.25rem;
      border-bottom: 1px solid #d6d3d1;
    }
    .book-title {
      font-family: 'Plus Jakarta Sans', sans-serif;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      font-size: 9pt;
      color: #78716c;
      margin-bottom: 0.5rem;
    }
    .chapter-title {
      font-size: 22pt;
      font-weight: 600;
      color: #1c1917;
      margin: 0 0 0.5rem 0;
      line-height: 1.25;
    }
    .chapter-subtitle {
      font-size: 11pt;
      font-style: italic;
      color: #57534e;
      margin: 0;
    }
    
    .chapter-body p {
      margin-bottom: 1rem;
      text-align: justify;
    }
    .chapter-body blockquote {
      margin: 1.25rem 0;
      padding: 0.75rem 1.25rem;
      border-left: 3px solid #78350f;
      background: #fbfaf8;
      font-style: italic;
      color: #292524;
      break-inside: avoid;
    }
    .chapter-body h2 {
      font-size: 16pt;
      font-weight: 600;
      margin-top: 1.75rem;
      margin-bottom: 0.75rem;
      color: #1c1917;
      break-after: avoid;
    }
    .chapter-body h3 {
      font-size: 13pt;
      font-weight: 600;
      margin-top: 1.25rem;
      margin-bottom: 0.5rem;
      color: #1c1917;
      break-after: avoid;
    }
    
    .citations-section {
      margin-top: 3rem;
      padding-top: 1.5rem;
      border-top: 1.5px solid #d6d3d1;
      font-family: 'Plus Jakarta Sans', sans-serif;
      font-size: 9pt;
      color: #44403c;
      break-inside: avoid;
    }
    .citations-header {
      font-size: 10pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #1c1917;
      margin-bottom: 1rem;
    }
    .citations-list {
      padding-left: 1.25rem;
      margin: 0;
    }
    .citations-list li {
      margin-bottom: 0.6rem;
      line-height: 1.45;
    }
    .citation-source {
      font-family: 'Lora', serif;
      color: #57534e;
    }
    .citation-url {
      color: #0369a1;
      text-decoration: underline;
      font-size: 8pt;
      word-break: break-all;
    }
    
    @media print {
      body { padding: 0; }
    }
  </style>
</head>
<body>
  ${includeHeaderFolio ? `
  <div class="doc-header">
    <div class="book-title">${escapeXml(documentTitle)}</div>
    <h1 class="chapter-title">${escapeXml(chapter.title)}</h1>
    ${chapter.subtitle ? `<div class="chapter-subtitle">${escapeXml(chapter.subtitle)}</div>` : ''}
  </div>` : `
  <h1 class="chapter-title" style="margin-bottom: 1.5rem;">${escapeXml(chapter.title)}</h1>`}
  
  <div class="chapter-body">
    ${chapter.contentHtml}
  </div>

  ${includeCitations && citations.length > 0 ? `
  <div class="citations-section">
    <div class="citations-header">Archival Citations & Verified Sources (${citations.length})</div>
    <ol class="citations-list">
      ${citations.map((c, i) => `
        <li>
          <strong>[${c.number || i + 1}] ${escapeXml(c.eventTitle)} (${escapeXml(c.ancestorName)}):</strong>
          <span class="citation-source">${escapeXml(c.fullCitation)}</span>
          ${c.sourceUrl ? `<br/><span class="citation-url">${escapeXml(c.sourceUrl)}</span>` : ''}
        </li>
      `).join('')}
    </ol>
  </div>` : ''}
</body>
</html>`;

    const blob = new Blob([standaloneHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${documentTitle.replace(/\s+/g, '_')}_${chapter.title.replace(/\s+/g, '_')}_Publication.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  function escapeXml(unsafe: string) {
    return unsafe.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
        default: return c;
      }
    });
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/70 backdrop-blur-xs no-print animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdf-modal-title"
    >
      <div className="bg-[#FAF9F5] w-full max-w-5xl max-h-[92vh] rounded-2xl shadow-2xl border border-stone-300 flex flex-col overflow-hidden text-stone-900">
        
        {/* Sleek Top Header Bar */}
        <div className="px-5 py-3.5 border-b border-stone-200 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center shadow-2xs">
              <FileDown className="w-5 h-5 text-amber-800" />
            </div>
            <div>
              <h2 id="pdf-modal-title" className="text-base sm:text-lg font-bold font-serif-book text-stone-900 leading-tight">
                Print & Download Chapter as PDF
              </h2>
              <p className="text-xs text-stone-500 font-sans-ui">
                Publication-ready book layout with verified archival citations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
              title="Close window (Esc)"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Split into Left Config Bar & Right Live Book Preview */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-[#F5F2EB]">
          
          {/* Controls / Options Panel */}
          <div className="w-full md:w-80 bg-white border-b md:border-b-0 md:border-r border-stone-200 p-4 sm:p-5 flex flex-col gap-4 shrink-0 overflow-y-auto">
            
            {/* Quick Metrics */}
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-600 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-stone-500">Document:</span>
                <span className="font-semibold text-stone-800 truncate max-w-[150px]">{documentTitle}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-500">Current Chapter:</span>
                <span className="font-semibold text-stone-800 truncate max-w-[150px]">{chapter.title}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-500">Word Count:</span>
                <span className="font-mono-data font-bold text-stone-800">{wordCount.toLocaleString()} words</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-500">Estimated Pages:</span>
                <span className="font-mono-data font-bold text-amber-900">~{estimatedPages} {estimatedPages === 1 ? 'page' : 'pages'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-500">Archival Sources:</span>
                <span className="font-mono-data font-bold text-emerald-800">{citations.length} cited</span>
              </div>
            </div>

            {/* Layout Options */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500 block">
                Page Formatting
              </span>

              {/* Paper Format */}
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Paper Size
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-stone-100 rounded-lg border border-stone-200">
                  <button
                    type="button"
                    onClick={() => setPaperFormat('letter')}
                    className={`py-1.5 text-xs font-medium rounded-md transition-all ${
                      paperFormat === 'letter' ? 'bg-white text-stone-900 shadow-2xs font-semibold' : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Letter
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaperFormat('a4')}
                    className={`py-1.5 text-xs font-medium rounded-md transition-all ${
                      paperFormat === 'a4' ? 'bg-white text-stone-900 shadow-2xs font-semibold' : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    A4
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaperFormat('trade')}
                    className={`py-1.5 text-xs font-medium rounded-md transition-all ${
                      paperFormat === 'trade' ? 'bg-white text-stone-900 shadow-2xs font-semibold' : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    6×9" Book
                  </button>
                </div>
              </div>

              {/* Font Size Scale */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-stone-700">
                    Body Text Size
                  </label>
                  <span className="text-xs font-mono-data text-stone-500 font-medium">
                    {fontSizePt}pt
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="16"
                  step="1"
                  value={fontSizePt}
                  onChange={e => setFontSizePt(Number(e.target.value))}
                  className="w-full accent-amber-700 cursor-pointer"
                />
              </div>

              {/* Line Spacing */}
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Line Spacing
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-stone-100 rounded-lg border border-stone-200">
                  <button
                    type="button"
                    onClick={() => setLineSpacing('1.5')}
                    className={`py-1 text-xs font-medium rounded-md transition-all ${
                      lineSpacing === '1.5' ? 'bg-white text-stone-900 shadow-2xs font-semibold' : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    1.5
                  </button>
                  <button
                    type="button"
                    onClick={() => setLineSpacing('1.75')}
                    className={`py-1 text-xs font-medium rounded-md transition-all ${
                      lineSpacing === '1.75' ? 'bg-white text-stone-900 shadow-2xs font-semibold' : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    1.75
                  </button>
                  <button
                    type="button"
                    onClick={() => setLineSpacing('2.0')}
                    className={`py-1 text-xs font-medium rounded-md transition-all ${
                      lineSpacing === '2.0' ? 'bg-white text-stone-900 shadow-2xs font-semibold' : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Double
                  </button>
                </div>
              </div>

              {/* Toggles */}
              <div className="pt-2 border-t border-stone-200 space-y-2.5">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-800">
                  <input
                    type="checkbox"
                    checked={includeCitations}
                    onChange={e => setIncludeCitations(e.target.checked)}
                    className="rounded text-amber-700 focus:ring-amber-600 h-4 w-4"
                  />
                  <span>Include Archival Citations ({citations.length})</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-800">
                  <input
                    type="checkbox"
                    checked={includeHeaderFolio}
                    onChange={e => setIncludeHeaderFolio(e.target.checked)}
                    className="rounded text-amber-700 focus:ring-amber-600 h-4 w-4"
                  />
                  <span>Include Book Title Header & Folio</span>
                </label>
              </div>
            </div>

            {/* Quick Senior / User Tip */}
            <div className="mt-auto p-3 bg-amber-50/70 rounded-xl border border-amber-200/80 text-[11px] text-amber-950 leading-relaxed">
              <strong className="font-semibold block mb-0.5">Tip for Saving as PDF:</strong>
              When your browser's Print window opens, select <strong>"Save as PDF"</strong> in the <em>Destination</em> dropdown to save this file to your computer.
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handlePrintToPdf}
                className="w-full py-2.5 px-4 bg-amber-800 hover:bg-amber-900 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print or Save to PDF</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadHtmlFile}
                className="w-full py-2 px-3 bg-white hover:bg-stone-50 border border-stone-300 text-stone-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                title="Download self-contained offline publication file"
              >
                <FileCode className="w-3.5 h-3.5 text-stone-500" />
                <span>Download Standalone HTML</span>
              </button>
            </div>

          </div>

          {/* Right Live Book Preview Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col items-center justify-start">
            
            {/* Visual Indicator */}
            <div className="mb-3 flex items-center gap-2 text-xs text-stone-500">
              <Eye className="w-3.5 h-3.5 text-amber-700" />
              <span>Print Preview Mode (Live layout as will appear in PDF)</span>
            </div>

            {/* Simulated Paper Sheet */}
            <div 
              ref={previewRef}
              style={{
                fontSize: `${fontSizePt}pt`,
                lineHeight: lineSpacing,
                maxWidth: paperFormat === 'trade' ? '540px' : '720px'
              }}
              className="w-full bg-white shadow-xl rounded-sm border border-stone-300 p-8 sm:p-14 text-stone-900 font-serif-book transition-all min-h-[750px]"
            >
              {/* Header / Folio */}
              {includeHeaderFolio && (
                <div className="text-center pb-5 mb-8 border-b border-stone-200">
                  <p className="text-[10px] font-sans-ui uppercase tracking-widest text-stone-500 mb-1">
                    {documentTitle}
                  </p>
                  <h1 className="text-2xl sm:text-3xl font-bold font-serif-book text-stone-900 leading-tight">
                    {chapter.title}
                  </h1>
                  {chapter.subtitle && (
                    <p className="text-xs sm:text-sm italic text-stone-600 font-serif-book mt-1">
                      {chapter.subtitle}
                    </p>
                  )}
                </div>
              )}

              {/* Chapter Content */}
              <div 
                className="chapter-rendered-preview space-y-4"
                dangerouslySetInnerHTML={{ __html: contentHtml }}
              />

              {/* Citations & Sources at the end of the document */}
              {includeCitations && (
                <div className="mt-12 pt-6 border-t-2 border-stone-200 font-sans-ui text-xs text-stone-700">
                  <div className="flex items-center gap-2 mb-3">
                    <BookMarked className="w-4 h-4 text-amber-800" />
                    <h3 className="font-bold uppercase tracking-wider text-stone-900 text-xs">
                      Archival Citations & Verified Sources ({citations.length})
                    </h3>
                  </div>

                  {citations.length === 0 ? (
                    <p className="text-stone-400 italic text-[11px]">
                      No citations attached to this chapter.
                    </p>
                  ) : (
                    <ol className="space-y-2 list-decimal list-inside text-stone-600">
                      {citations.map((cite, idx) => (
                        <li key={cite.id || idx} className="leading-relaxed">
                          <strong className="text-stone-900 font-semibold">
                            {cite.eventTitle} ({cite.ancestorName}):
                          </strong>{' '}
                          <span className="font-serif-book text-stone-800">{cite.fullCitation}</span>{' '}
                          {cite.sourceUrl && (
                            <span className="text-[10px] text-blue-700 underline break-all ml-1">
                              [{cite.provider === 'familysearch' ? 'FamilySearch Archive' : 'Ancestry Archive'}: {cite.sourceUrl}]
                            </span>
                          )}
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              )}

              {/* Page Number simulation */}
              <div className="mt-12 pt-4 border-t border-stone-100 flex justify-between items-center text-[10px] text-stone-400 font-sans-ui">
                <span>{documentTitle}</span>
                <span className="font-mono-data">Page 1</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
