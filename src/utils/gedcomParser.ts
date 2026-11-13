import { Ancestor, TimelineFact, RecordSource, EventType } from '../types/genealogy';

export interface ParsedGedcomResult {
  ancestors: Ancestor[];
  facts: TimelineFact[];
  stats: {
    totalIndividuals: number;
    totalEvents: number;
    dateRange: string;
    sourceSystem: string;
  };
}

/**
 * Parses standard GEDCOM 5.5 / 5.5.1 text into typed Ancestors and Timeline Facts.
 */
export function parseGedcom(gedcomText: string, defaultProvider: 'ancestry' | 'familysearch' = 'ancestry'): ParsedGedcomResult {
  const lines = gedcomText.split(/\r?\n/);
  const ancestors: Ancestor[] = [];
  const facts: TimelineFact[] = [];

  let currentIndi: Partial<Ancestor> | null = null;
  let currentIndiId: string | null = null;
  let currentEvent: {
    type?: EventType;
    title?: string;
    dateStr?: string;
    year?: number;
    place?: string;
    description?: string;
    sources?: string[];
  } | null = null;

  let currentSourceRef: string | null = null;
  let sourceSystem = 'GEDCOM File';

  const flushEvent = () => {
    if (currentIndiId && currentEvent && currentEvent.type) {
      const year = currentEvent.year || (currentEvent.dateStr ? (extractYear(currentEvent.dateStr) ?? 1900) : 1900);
      const factId = `fact_${currentIndiId}_${currentEvent.type}_${year}_${Math.random().toString(36).substring(2, 7)}`;
      
      const recordSource: RecordSource = {
        id: `src_${factId}`,
        provider: defaultProvider,
        sourceTitle: currentEvent.title || `${currentEvent.type.toUpperCase()} Record`,
        collection: `${defaultProvider === 'ancestry' ? 'Ancestry Member Trees & Historical Records' : 'FamilySearch Family Tree & Vital Index'}`,
        recordType: currentEvent.type,
        dateFound: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        externalUrl: defaultProvider === 'ancestry' 
          ? `https://www.ancestry.com/search/?name=${encodeURIComponent(currentIndi?.name || '')}&birth=${year}`
          : `https://www.familysearch.org/search/record/results?q.givenName=${encodeURIComponent(currentIndi?.name?.split(' ')[0] || '')}&q.birthLikeDate.from=${year - 2}&q.birthLikeDate.to=${year + 2}`,
        citationText: `${defaultProvider === 'ancestry' ? 'Ancestry.com' : 'FamilySearch.org'}. GEDCOM Import Record for ${currentIndi?.name || 'Individual'}: ${currentEvent.type} at ${currentEvent.place || 'Unknown location'} (${currentEvent.dateStr || year}).`,
        confidence: 'primary'
      };

      facts.push({
        id: factId,
        ancestorId: currentIndiId,
        eventType: currentEvent.type,
        title: currentEvent.title || formatEventTitle(currentEvent.type),
        year,
        dateStr: currentEvent.dateStr || `${year}`,
        place: currentEvent.place || 'Location not recorded',
        description: currentEvent.description || `${formatEventTitle(currentEvent.type)} documented in ${defaultProvider === 'ancestry' ? 'Ancestry' : 'FamilySearch'} family records.`,
        sources: [recordSource],
        isDeduplicated: false
      });
      currentEvent = null;
    }
  };

  const flushIndi = () => {
    flushEvent();
    if (currentIndi && currentIndiId) {
      ancestors.push({
        id: currentIndiId,
        name: currentIndi.name || 'Unknown Relative',
        gender: currentIndi.gender || 'O',
        birthYear: currentIndi.birthYear || 1900,
        deathYear: currentIndi.deathYear || 'Living',
        birthPlace: currentIndi.birthPlace || 'Unknown',
        deathPlace: currentIndi.deathPlace || 'Unknown',
        relationship: currentIndi.relationship || 'Ancestor',
        generation: currentIndi.generation || 1,
        bioSummary: currentIndi.bioSummary || `Genealogical record imported from ${defaultProvider === 'ancestry' ? 'Ancestry.com' : 'FamilySearch.org'}.`,
        treeBranch: currentIndi.treeBranch || 'Paternal'
      });
      currentIndi = null;
      currentIndiId = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) continue;

    // GEDCOM lines format: level tag/id rest
    const match = rawLine.match(/^(\d+)\s+(@[^@]+@|[A-Za-z0-9_]+)\s*(.*)$/);
    if (!match) continue;

    const level = parseInt(match[1], 10);
    const tagOrId = match[2];
    const value = match[3];

    if (level === 1 && tagOrId === 'SOUR' && !currentIndi) {
      sourceSystem = value || 'Ancestry / FamilySearch';
    }

    // Individual record start: "0 @I123@ INDI"
    if (level === 0 && value === 'INDI') {
      flushIndi();
      currentIndiId = tagOrId.replace(/@/g, '');
      currentIndi = {
        id: currentIndiId,
        relationship: 'Direct Line'
      };
      continue;
    }

    if (level === 0 && tagOrId !== 'INDI') {
      flushIndi();
      continue;
    }

    if (!currentIndi) continue;

    // Inside INDI
    if (level === 1) {
      flushEvent(); // Flush any previous event under this person

      if (tagOrId === 'NAME') {
        const cleanName = value.replace(/\//g, '').trim();
        currentIndi.name = cleanName;
      } else if (tagOrId === 'SEX') {
        currentIndi.gender = value.toUpperCase().startsWith('M') ? 'M' : value.toUpperCase().startsWith('F') ? 'F' : 'O';
      } else if (tagOrId === 'BIRT') {
        currentEvent = { type: 'birth', title: 'Birth Recorded' };
      } else if (tagOrId === 'DEAT') {
        currentEvent = { type: 'death', title: 'Death Recorded' };
      } else if (tagOrId === 'BURI') {
        currentEvent = { type: 'burial', title: 'Burial Record' };
      } else if (tagOrId === 'CENS') {
        currentEvent = { type: 'census', title: 'Census Enumeration' };
      } else if (tagOrId === 'OCCU') {
        currentEvent = { type: 'occupation', title: 'Occupation Record', description: value };
      } else if (tagOrId === 'RESI') {
        currentEvent = { type: 'residence', title: 'Residence' };
      } else if (tagOrId === 'MARR') {
        currentEvent = { type: 'marriage', title: 'Marriage Record' };
      } else if (tagOrId === 'IMMI') {
        currentEvent = { type: 'immigration', title: 'Immigration / Arrival' };
      }
    } else if (level === 2 && currentEvent) {
      if (tagOrId === 'DATE') {
        currentEvent.dateStr = value;
        const year = extractYear(value);
        if (year) {
          currentEvent.year = year;
          if (currentEvent.type === 'birth') currentIndi.birthYear = year;
          if (currentEvent.type === 'death') currentIndi.deathYear = year;
        }
      } else if (tagOrId === 'PLAC') {
        currentEvent.place = value;
        if (currentEvent.type === 'birth' && !currentIndi.birthPlace) currentIndi.birthPlace = value;
        if (currentEvent.type === 'death' && !currentIndi.deathPlace) currentIndi.deathPlace = value;
      } else if (tagOrId === 'NOTE') {
        currentEvent.description = value;
      }
    }
  }

  flushIndi();

  // Calculate year span
  const allYears = facts.map(f => f.year).filter(y => y > 1500 && y < 2050);
  const minYear = allYears.length ? Math.min(...allYears) : 1850;
  const maxYear = allYears.length ? Math.max(...allYears) : 1970;

  return {
    ancestors,
    facts,
    stats: {
      totalIndividuals: ancestors.length,
      totalEvents: facts.length,
      dateRange: `${minYear} – ${maxYear}`,
      sourceSystem
    }
  };
}

function extractYear(dateStr: string): number | null {
  const match = dateStr.match(/\b(1[6-9]\d{2}|20\d{2})\b/);
  return match ? parseInt(match[1], 10) : null;
}

function formatEventTitle(type: EventType): string {
  switch (type) {
    case 'birth': return 'Birth';
    case 'baptism': return 'Baptism & Christening';
    case 'residence': return 'Residence Entry';
    case 'census': return 'Federal / State Census';
    case 'military': return 'Military Service & Draft';
    case 'marriage': return 'Marriage Ceremony';
    case 'immigration': return 'Immigration & Ship Arrival';
    case 'occupation': return 'Occupation & Trade';
    case 'death': return 'Death';
    case 'burial': return 'Burial & Gravesite';
    case 'probate': return 'Probate & Will Records';
    default: return 'Life Event';
  }
}

/**
 * Generates sample GEDCOM content for grandfather to test immediate export/import
 */
export function generateSampleGedcomText(): string {
  return `0 HEAD
1 SOUR ANCESTRY_COM
2 VERS 2026.1
1 GEDC
2 VERS 5.5.1
2 FORM LINEAGE-LINKED
0 @I1@ INDI
1 NAME Ancil Chesterfield /Scott/
1 SEX M
1 BIRT
2 DATE 12 AUG 1918
2 PLAC Fitts Village, St. James Parish, Barbados
1 BAPM
2 DATE 22 SEP 1918
2 PLAC St. James Parish Church, Holetown, Barbados
1 CENS
2 DATE 24 APR 1921
2 PLAC Fitts Village, St. James Parish, Barbados
1 MARR
2 DATE 19 NOV 1941
2 PLAC St. James Parish Church, Holetown, Barbados
1 IMMI
2 DATE 04 JUN 1955
2 PLAC Port of Southampton, UK (ex SS Colombie)
1 DEAT
2 DATE 14 OCT 1998
2 PLAC Fitts Village, St. James Parish, Barbados
1 BURI
2 DATE 18 OCT 1998
2 PLAC St. James Parish Churchyard, Holetown, Barbados
0 @I2@ INDI
1 NAME Evelyn Marguerite /Alleyne/
1 SEX F
1 BIRT
2 DATE 14 MAR 1921
2 PLAC Carlton, St. James Parish, Barbados
1 DEAT
2 DATE 08 JUL 2005
2 PLAC Fitts Village, St. James Parish, Barbados
0 @I3@ INDI
1 NAME Joseph Nathaniel /Scott/
1 SEX M
1 BIRT
2 DATE 18 NOV 1885
2 PLAC St. James Parish, Barbados
1 MARR
2 DATE 08 JUN 1915
2 PLAC St. James Parish Church, Holetown, Barbados
1 DEAT
2 DATE 22 MAY 1961
2 PLAC Fitts Village, St. James Parish, Barbados
0 @I4@ INDI
1 NAME Samuel Thomas /Scott/
1 SEX M
1 BIRT
2 DATE 04 APR 1852
2 PLAC St. James Parish, Barbados
1 DEAT
2 DATE 11 NOV 1926
2 PLAC Fitts Village, St. James Parish, Barbados
0 TRLR`;
}
