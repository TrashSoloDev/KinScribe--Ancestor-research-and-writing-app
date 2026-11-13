import mammoth from 'mammoth';
import { ManuscriptChapter } from '../types/genealogy';

export interface ImportedManuscript {
  title: string;
  chapters: ManuscriptChapter[];
  totalWordCount: number;
  formatDetected: 'docx' | 'html' | 'markdown' | 'text';
}

/**
 * Parses markdown text into clean semantic HTML preserving layout & formatting
 */
function markdownToHtml(md: string): string {
  // Normalize line endings
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const htmlParts: string[] = [];
  let inList = false;
  let inOrderedList = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Close lists if line is empty or not list
    if (inList && !line.match(/^[\*\-\+]\s+/)) {
      htmlParts.push('</ul>');
      inList = false;
    }
    if (inOrderedList && !line.match(/^\d+\.\s+/)) {
      htmlParts.push('</ol>');
      inOrderedList = false;
    }

    if (!line.trim()) {
      continue;
    }

    // Headings
    if (line.startsWith('### ')) {
      htmlParts.push(`<h4>${escapeAndFormatInline(line.slice(4))}</h4>`);
    } else if (line.startsWith('## ')) {
      htmlParts.push(`<h3>${escapeAndFormatInline(line.slice(3))}</h3>`);
    } else if (line.startsWith('# ')) {
      htmlParts.push(`<h2>${escapeAndFormatInline(line.slice(2))}</h2>`);
    } else if (line.startsWith('> ')) {
      htmlParts.push(`<blockquote>${escapeAndFormatInline(line.slice(2))}</blockquote>`);
    } else if (line.match(/^[\*\-\+]\s+/)) {
      if (!inList) {
        htmlParts.push('<ul>');
        inList = true;
      }
      htmlParts.push(`<li>${escapeAndFormatInline(line.replace(/^[\*\-\+]\s+/, ''))}</li>`);
    } else if (line.match(/^\d+\.\s+/)) {
      if (!inOrderedList) {
        htmlParts.push('<ol>');
        inOrderedList = true;
      }
      htmlParts.push(`<li>${escapeAndFormatInline(line.replace(/^\d+\.\s+/, ''))}</li>`);
    } else if (line.trim() === '---' || line.trim() === '***') {
      htmlParts.push('<hr />');
    } else {
      htmlParts.push(`<p>${escapeAndFormatInline(line)}</p>`);
    }
  }

  if (inList) htmlParts.push('</ul>');
  if (inOrderedList) htmlParts.push('</ol>');

  return htmlParts.join('\n');
}

function escapeAndFormatInline(text: string): string {
  let res = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Bold & Italic
  res = res.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
  res = res.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  res = res.replace(/__(.*?)__/g, '<strong>$1</strong>');
  res = res.replace(/\*(.*?)\*/g, '<em>$1</em>');
  res = res.replace(/_(.*?)_/g, '<em>$1</em>');

  return res;
}

/**
 * Converts plain text into clean styled paragraphs with heading detection
 */
function plainTextToHtml(text: string): string {
  const paragraphs = text
    .replace(/\r\n/g, '\n')
    .split(/\n\s*\n+/)
    .map(p => p.trim())
    .filter(Boolean);

  return paragraphs.map(p => {
    // If paragraph is short and looks like a chapter title or header
    if (p.length < 80 && (/^(Chapter|PROLOGUE|EPILOGUE|PART|\d+\.)/i.test(p) || p === p.toUpperCase())) {
      return `<h2>${p}</h2>`;
    }
    // Clean linebreaks inside paragraph
    const cleanLines = p.replace(/\n/g, '<br />');
    return `<p>${cleanLines}</p>`;
  }).join('\n');
}

/**
 * Extracts and cleans HTML content from uploaded .html or .htm files
 */
function cleanImportedHtml(rawHtml: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(rawHtml, 'text/html');

  // Strip script, style, meta, head
  const scripts = doc.querySelectorAll('script, style, meta, link');
  scripts.forEach(s => s.remove());

  const bodyContent = doc.body ? doc.body.innerHTML : rawHtml;
  return bodyContent.trim();
}

/**
 * Splits formatted HTML into multiple chapters if headings indicate chapter boundaries
 */
function splitHtmlIntoChapters(html: string, fallbackTitle: string): ManuscriptChapter[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
  const container = doc.body.firstElementChild;
  if (!container) {
    return [{
      id: `ch_${Date.now()}`,
      title: fallbackTitle,
      subtitle: '',
      contentHtml: html,
      wordCount: countWords(html),
      updatedAt: Date.now()
    }];
  }

  const childNodes = Array.from(container.children);
  const chapterSections: { title: string; subtitle: string; elements: Element[] }[] = [];
  let currentTitle = fallbackTitle;
  let currentSubtitle = '';
  let currentElements: Element[] = [];

  for (let i = 0; i < childNodes.length; i++) {
    const el = childNodes[i];
    const isHeading = el.tagName === 'H1' || el.tagName === 'H2';
    const text = el.textContent?.trim() || '';
    const isChapterMarker = isHeading && (text.toLowerCase().includes('chapter') || /^(part|\d+\.)/i.test(text) || chapterSections.length === 0);

    if (isChapterMarker && currentElements.length > 0) {
      chapterSections.push({
        title: currentTitle,
        subtitle: currentSubtitle,
        elements: currentElements
      });
      currentTitle = text || `Chapter ${chapterSections.length + 1}`;
      currentSubtitle = '';
      currentElements = [];
    } else if (isHeading && currentElements.length === 0) {
      currentTitle = text;
    } else {
      currentElements.push(el);
    }
  }

  if (currentElements.length > 0) {
    chapterSections.push({
      title: currentTitle,
      subtitle: currentSubtitle,
      elements: currentElements
    });
  }

  if (chapterSections.length === 0) {
    return [{
      id: `ch_${Date.now()}`,
      title: fallbackTitle,
      subtitle: '',
      contentHtml: html,
      wordCount: countWords(html),
      updatedAt: Date.now()
    }];
  }

  return chapterSections.map((sec, idx) => {
    const secHtml = sec.elements.map(el => el.outerHTML).join('\n');
    return {
      id: `ch_${Date.now()}_${idx}`,
      title: sec.title.length > 80 ? sec.title.slice(0, 77) + '...' : sec.title,
      subtitle: sec.subtitle,
      contentHtml: secHtml,
      wordCount: countWords(secHtml),
      updatedAt: Date.now()
    };
  });
}

function countWords(html: string): number {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return text ? text.split(/\s+/).length : 0;
}

/**
 * Master parser for reading any uploaded manuscript file (.docx, .doc, .html, .md, .txt)
 */
export async function parseUploadedManuscriptFile(file: File): Promise<ImportedManuscript> {
  const fileName = file.name;
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  const cleanTitle = fileName.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');

  let rawHtml = '';
  let formatDetected: ImportedManuscript['formatDetected'] = 'text';

  if (ext === 'docx') {
    formatDetected = 'docx';
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });
    rawHtml = result.value;
  } else if (ext === 'html' || ext === 'htm') {
    formatDetected = 'html';
    const text = await file.text();
    rawHtml = cleanImportedHtml(text);
  } else if (ext === 'md' || ext === 'markdown') {
    formatDetected = 'markdown';
    const text = await file.text();
    rawHtml = markdownToHtml(text);
  } else {
    // txt or rtf or fallback
    formatDetected = 'text';
    const text = await file.text();
    rawHtml = plainTextToHtml(text);
  }

  // Split into chapters if multi-chapter structure is detected
  const chapters = splitHtmlIntoChapters(rawHtml, cleanTitle);
  const totalWordCount = chapters.reduce((sum, ch) => sum + ch.wordCount, 0);

  return {
    title: cleanTitle,
    chapters,
    totalWordCount,
    formatDetected
  };
}
