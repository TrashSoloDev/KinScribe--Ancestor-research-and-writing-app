import { TimelineFact, RecordSource, EventType } from '../types/genealogy';

/**
 * Normalizes location strings to extract key town/city/state tokens
 */
function extractLocationTokens(place: string): string[] {
  return place
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 2 && !['usa', 'the', 'and', 'county', 'ward'].includes(token));
}

/**
 * Checks if two places have substantial overlap
 */
function placesOverlap(placeA: string, placeB: string): boolean {
  if (!placeA || !placeB) return true; // if one lacks place, don't rule out match
  const tokensA = extractLocationTokens(placeA);
  const tokensB = extractLocationTokens(placeB);
  if (tokensA.length === 0 || tokensB.length === 0) return true;
  
  const common = tokensA.filter(token => tokensB.includes(token));
  return common.length > 0;
}

/**
 * Compiles data from both FamilySearch and Ancestry, omitting duplicate entries
 * while combining their source citations into unified, verified records.
 */
export function deduplicateTimelineFacts(facts: TimelineFact[]): TimelineFact[] {
  const mergedFacts: TimelineFact[] = [];
  const processedFactIds = new Set<string>();

  // Sort facts chronologically first
  const sorted = [...facts].sort((a, b) => a.year - b.year || a.title.localeCompare(b.title));

  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];
    if (processedFactIds.has(current.id)) continue;

    // Look ahead for duplicates of this event
    const matchingDuplicates: TimelineFact[] = [];

    for (let j = i + 1; j < sorted.length; j++) {
      const candidate = sorted[j];
      if (processedFactIds.has(candidate.id)) continue;

      // Must be same ancestor
      if (candidate.ancestorId !== current.ancestorId) continue;

      // Must be compatible event type
      const isSameType = candidate.eventType === current.eventType;
      
      // Must be within 1 year margin (genealogical records often vary by +/- 1 year between census & vital records)
      const isYearClose = Math.abs(candidate.year - current.year) <= 1;

      // Location match
      const isPlaceMatch = placesOverlap(candidate.place, current.place);

      // Census specific matching: must have same census decennial year (e.g. 1900, 1910, 1920, 1930)
      const isCensusExact = current.eventType === 'census' ? candidate.year === current.year : true;

      if (isSameType && isYearClose && isPlaceMatch && isCensusExact) {
        matchingDuplicates.push(candidate);
      }
    }

    if (matchingDuplicates.length > 0) {
      // Merge current fact with its duplicates!
      processedFactIds.add(current.id);
      matchingDuplicates.forEach(dup => processedFactIds.add(dup.id));

      // Combine sources from all matched facts
      const combinedSources: RecordSource[] = [...current.sources];
      matchingDuplicates.forEach(dup => {
        dup.sources.forEach(dupSource => {
          // Avoid exact source ID duplicates
          if (!combinedSources.some(s => s.id === dupSource.id || (s.provider === dupSource.provider && s.sourceTitle === dupSource.sourceTitle))) {
            combinedSources.push(dupSource);
          }
        });
      });

      // Best date string (prefer most detailed)
      const allDateStrs = [current.dateStr, ...matchingDuplicates.map(d => d.dateStr)];
      const bestDateStr = allDateStrs.sort((a, b) => b.length - a.length)[0] || current.dateStr;

      // Best place string
      const allPlaces = [current.place, ...matchingDuplicates.map(d => d.place)];
      const bestPlace = allPlaces.sort((a, b) => b.length - a.length)[0] || current.place;

      // Combined details
      const detailsSet = new Set<string>();
      if (current.details) current.details.forEach(d => detailsSet.add(d));
      matchingDuplicates.forEach(d => {
        if (d.details) d.details.forEach(detail => detailsSet.add(detail));
      });

      mergedFacts.push({
        id: `unified_${current.id}`,
        ancestorId: current.ancestorId,
        eventType: current.eventType,
        title: current.title,
        year: current.year,
        dateStr: bestDateStr,
        place: bestPlace,
        description: current.description || matchingDuplicates[0]?.description || '',
        details: Array.from(detailsSet),
        sources: combinedSources,
        isDeduplicated: true,
        notes: `Compiled from ${combinedSources.length} historical record sources across FamilySearch and Ancestry.`
      });
    } else {
      // Unique event found only on one site
      processedFactIds.add(current.id);
      mergedFacts.push({
        ...current,
        isDeduplicated: false
      });
    }
  }

  return mergedFacts.sort((a, b) => a.year - b.year);
}

/**
 * Builds live direct query link to FamilySearch.org for an ancestor
 */
export function buildFamilySearchRecordUrl(firstName: string, lastName: string, year?: number, place?: string): string {
  const params = new URLSearchParams();
  if (firstName) params.set('q.givenName', firstName);
  if (lastName) params.set('q.surname', lastName);
  if (year) {
    params.set('q.birthLikeDate.from', `${year - 2}`);
    params.set('q.birthLikeDate.to', `${year + 2}`);
  }
  if (place) params.set('q.birthLikePlace', place);
  return `https://www.familysearch.org/search/record/results?${params.toString()}`;
}

/**
 * Builds live direct query link to Ancestry.com for an ancestor
 */
export function buildAncestryRecordUrl(firstName: string, lastName: string, year?: number, place?: string): string {
  const nameParam = `${firstName || ''}_${lastName || ''}`.trim().replace(/\s+/g, '+');
  const birthParam = year ? `${year}_${encodeURIComponent(place || '')}` : '';
  return `https://www.ancestry.com/search/?name=${nameParam}${birthParam ? `&birth=${birthParam}` : ''}`;
}
