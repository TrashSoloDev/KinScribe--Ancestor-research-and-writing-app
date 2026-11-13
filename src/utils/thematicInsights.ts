import { TimelineFact } from '../types/genealogy';

export interface ThematicInsight {
  id: string;
  category: 'occupation' | 'location' | 'milestone' | 'cultural' | 'diaspora';
  theme: string;
  badge: string;
  factIds: string[];
  frequency: number;
  yearsSpan: string;
  chapterIdeaTitle: string;
  chapterPrompt: string;
  relatedLocations: string[];
}

interface ThemePattern {
  id: string;
  category: ThematicInsight['category'];
  theme: string;
  badge: string;
  keywords: string[];
  chapterIdeaTitle: string;
  chapterPrompt: string;
}

const PREDEFINED_THEME_PATTERNS: ThemePattern[] = [
  {
    id: 'theme_boatbuilding',
    category: 'occupation',
    theme: 'Boatbuilding & Maritime Trades',
    badge: 'Craft & Seafaring',
    keywords: ['boat', 'boatwright', 'shipwright', 'cedar', 'sloop', 'flying fish', 'whaleboat', 'marine board', 'carpentry', 'cooper', 'wharf'],
    chapterIdeaTitle: 'The Flying Fish Sloops: Master Woodcrafters of the Shoreline',
    chapterPrompt: 'Explore how your ancestors engineered traditional wooden craft using Barbadian white cedar and mahogany to navigate the coastal Atlantic currents.'
  },
  {
    id: 'theme_st_james_church',
    category: 'location',
    theme: 'St. James Parish Church & Holetown Sacraments',
    badge: 'Faith & Parish Life',
    keywords: ['st. james parish church', 'holetown', 'parish church', 'baptiz', 'baptism', 'matrimony', 'holy matrimony', 'canon', 'parish register', 'sacramental', 'churchyard', 'burial register'],
    chapterIdeaTitle: 'Under the Bell of Holetown: Three Centuries of Parish Sacraments',
    chapterPrompt: 'Detail the spiritual milestones recorded in the historic 1628 parish registers, from newborn baptisms to beachfront churchyard memorials.'
  },
  {
    id: 'theme_fitts_village_coastal',
    category: 'location',
    theme: 'Fitts Village Coastal Settlement',
    badge: 'Ancestral Homestead',
    keywords: ['fitts village', 'highway 1', 'coastal road', 'coastal tract', 'prospect', 'paynes bay', 'coral beach', 'freehold', 'beachfront'],
    chapterIdeaTitle: 'From Sugar to Salt: Establishing Freehold Roots on the West Coast',
    chapterPrompt: 'Chronicle the transition of your lineage from inland plantation tenancy to independent coastal landholders along Highway 1 in Fitts Village.'
  },
  {
    id: 'theme_fishing_coastal_subsistence',
    category: 'occupation',
    theme: 'Seine Net Hauling & Flying Fish Fishery',
    badge: 'Maritime Economy',
    keywords: ['seine', 'fisherman', 'fishing', 'net', 'flying fish', 'cooperage', 'barrels', 'beach market', 'sea-grape'],
    chapterIdeaTitle: 'The Morning Breakers: Seine Haulers and the Beach Economy',
    chapterPrompt: 'Recount the cooperative community labor of seine netting and the vibrant seaside commerce under the sea-grape trees.'
  },
  {
    id: 'theme_colonial_census_land',
    category: 'milestone',
    theme: 'Colonial Land Deeds & Freehold Autonomy',
    badge: 'Land & Property',
    keywords: ['deed', 'conveyance', 'registrar of titles', 'freehold', 'landowner', 'half-acre', 'parcel', 'property', 'land grant'],
    chapterIdeaTitle: 'Carving Our Own Ground: The Freehold Deeds of St. James',
    chapterPrompt: 'Examine how post-emancipation smallholders strategically purchased land parcels to guarantee generational sovereignty for their descendants.'
  },
  {
    id: 'theme_diaspora_migration',
    category: 'diaspora',
    theme: 'Transatlantic Voyages & The Diaspora',
    badge: 'Diaspora & Journey',
    keywords: ['passenger', 'voyage', 'ss colombie', 'southampton', 'uk', 'incoming passenger', 'diaspora', 'french line', 'immigration', 'departed'],
    chapterIdeaTitle: 'Carried Across the Atlantic: The Post-War Diaspora & Beyond',
    chapterPrompt: 'Trace the journeys of kin who traversed oceanic borders while keeping the memory and values of Fitts Village burning brightly.'
  },
  {
    id: 'theme_post_emancipation_survival',
    category: 'cultural',
    theme: 'Post-Emancipation Resilience & Kinship Networks',
    badge: 'Heritage & Identity',
    keywords: ['emancipation', 'post-emancipation', 'laborer', 'ward', 'alleyne', 'baird', 'jordan', 'homestead', 'godparents', 'banns'],
    chapterIdeaTitle: 'Unbroken Kinship: Interwoven Families of the West Coast',
    chapterPrompt: 'Highlight the resilient kinship bonds uniting the Scott, Ward, Alleyne, and Baird lineages across generations of Barbadian history.'
  }
];

/**
 * Analyzes a given set of facts to automatically extract recurring themes,
 * recurring locations, and repeated trades.
 */
export function analyzeThematicInsights(facts: TimelineFact[]): ThematicInsight[] {
  if (!facts || facts.length === 0) return [];

  const insights: ThematicInsight[] = [];

  // 1. Evaluate predefined curated patterns
  for (const pattern of PREDEFINED_THEME_PATTERNS) {
    const matchingFactIds = new Set<string>();
    const locationsFound = new Set<string>();
    const years: number[] = [];

    facts.forEach(fact => {
      const searchTarget = [
        fact.title,
        fact.description,
        fact.place,
        ...(fact.details || []),
        ...fact.sources.map(s => `${s.sourceTitle} ${s.collection} ${s.citationText}`)
      ].join(' ').toLowerCase();

      const matches = pattern.keywords.some(kw => searchTarget.includes(kw.toLowerCase()));
      if (matches) {
        matchingFactIds.add(fact.id);
        years.push(fact.year);
        if (fact.place) {
          locationsFound.add(fact.place);
        }
      }
    });

    if (matchingFactIds.size >= 1) {
      years.sort((a, b) => a - b);
      const yearsSpan = years.length === 1 
        ? `${years[0]}` 
        : `${years[0]}–${years[years.length - 1]}`;

      insights.push({
        id: pattern.id,
        category: pattern.category,
        theme: pattern.theme,
        badge: pattern.badge,
        factIds: Array.from(matchingFactIds),
        frequency: matchingFactIds.size,
        yearsSpan,
        chapterIdeaTitle: pattern.chapterIdeaTitle,
        chapterPrompt: pattern.chapterPrompt,
        relatedLocations: Array.from(locationsFound).slice(0, 3)
      });
    }
  }

  // 2. Discover custom recurring location clusters (places mentioned in >= 2 distinct events)
  const locationClusterMap = new Map<string, { factIds: string[]; years: number[]; rawPlace: string }>();

  facts.forEach(fact => {
    if (!fact.place) return;
    const key = fact.place.trim();
    if (!locationClusterMap.has(key)) {
      locationClusterMap.set(key, { factIds: [], years: [], rawPlace: fact.place });
    }
    const item = locationClusterMap.get(key)!;
    item.factIds.push(fact.id);
    item.years.push(fact.year);
  });

  locationClusterMap.forEach((val, key) => {
    const isAlreadyPredefined = key.toLowerCase().includes('fitts village') || key.toLowerCase().includes('st. james parish church');
    if (val.factIds.length >= 2 && !isAlreadyPredefined) {
      val.years.sort((a, b) => a - b);
      const yearsSpan = val.years[0] === val.years[val.years.length - 1] 
        ? `${val.years[0]}` 
        : `${val.years[0]}–${val.years[val.years.length - 1]}`;

      insights.push({
        id: `loc_cluster_${encodeURIComponent(key.slice(0, 15))}`,
        category: 'location',
        theme: `Recurring Location: ${key}`,
        badge: 'Geographic Focus',
        factIds: val.factIds,
        frequency: val.factIds.length,
        yearsSpan,
        chapterIdeaTitle: `Life and Times Around ${key}`,
        chapterPrompt: `Discuss how your family's daily rhythms were shaped by this historic epicenter over multiple decades (${yearsSpan}).`,
        relatedLocations: [key]
      });
    }
  });

  return insights.sort((a, b) => b.frequency - a.frequency);
}
