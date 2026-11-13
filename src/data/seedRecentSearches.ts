import { HistoricalSearchQuery } from '../types/genealogy';

export const INITIAL_RECENT_SEARCHES: HistoricalSearchQuery[] = [
  {
    id: 'search_1921_census',
    term: '1921 Census of Barbados',
    context: 'Chapter 2: The 1921 Population Schedule & West Coast Homesteads',
    timestamp: 'Today at 9:42 AM',
    createdAt: Date.now() - 1000 * 60 * 35,
    resultSnippet: 'The 1921 Census of Barbados was a comprehensive enumeration across District E (St. James). Recorded households by head of family, age, maritime occupations (boatbuilders and coopers), religion, and literacy following World War I.',
    fullExplanation: 'The 1921 Census of Barbados was an enumeration conducted across all eleven parishes (including St. James and St. Michael). It recorded households by head of family, age, occupation (notably boatbuilders, fishermen, and coopers), religion, and literacy following the end of the First World War and during the inter-war sugar economy transitions. These schedules provide critical cross-verification for Barbadian family genealogies.',
    sources: [
      { title: '1921 Census of Barbados - Blue Book Archives', uri: 'https://www.familysearch.org/search/collection/1920801' },
      { title: 'British Colonial Office Records (CO 28 - Barbados)', uri: 'https://discovery.nationalarchives.gov.uk/' }
    ]
  },
  {
    id: 'search_fitts_boatbuilding',
    term: 'Fitts Village Master Boatbuilding',
    context: 'Chapter 1: The Wooden Boatwrights of St. James Beach',
    timestamp: 'Yesterday at 3:15 PM',
    createdAt: Date.now() - 1000 * 60 * 60 * 18,
    resultSnippet: 'Master shipwrights of Fitts Village built traditional 22-foot flying fish sloops and open whaleboats directly upon the beach using local mahogany transoms and native cedar framing.',
    fullExplanation: 'Fitts Village in the parish of St. James is historically celebrated for its master maritime craftsmanship and wooden fishing boat construction along the west coast. Master boatwrights such as Ancil Scott and his ancestors built open sea craft using silverballi and local mahogany timber, launching them directly from the beach into the calm Caribbean waters.',
    sources: [
      { title: 'The Fitts Village Story: From Sugar to Salt', uri: 'https://www.amazon.com/dp/B0D4N3J67L' },
      { title: 'Barbados Museum & Historical Society Marine Guilds', uri: 'https://www.barbmuse.org.bb/' }
    ]
  },
  {
    id: 'search_parish_registers',
    term: 'St. James Parish Church Sacristy Registers',
    context: 'Chapter 3: Baptismal Bonds at Holetown',
    timestamp: 'Nov 9, 2026',
    createdAt: Date.now() - 1000 * 60 * 60 * 48,
    resultSnippet: 'Consecrated circa 1628, St. James Parish Church preserved continuous baptism, marriage, and burial rolls essential for connecting emancipated lineages along the Platinum Coast.',
    fullExplanation: 'St. James Parish Church in Holetown, established around 1628, is among the oldest consecrated sanctuaries in the Western Hemisphere. Its sacristy registers preserved baptismal, marriage, and burial entries for generations of west coast Barbadians, linking ancestral lineage across both Anglican and Moravian congregations.',
    sources: [
      { title: 'St. James Parish Church Registers (Holetown)', uri: 'https://www.familysearch.org/search/collection/1920801' },
      { title: 'Barbados Registry of Deeds and Titles', uri: 'https://www.ancestry.com/search/collections/60275/' }
    ]
  },
  {
    id: 'search_freehold_deeds',
    term: 'Fitts Village Freehold Land Indentures',
    context: 'Chapter 1: Samuel Scott and the Freehold Movement',
    timestamp: 'Nov 8, 2026',
    createdAt: Date.now() - 1000 * 60 * 60 * 72,
    resultSnippet: 'Post-emancipation freehold conveyances in St. James allowed families to purchase small coastal plots along Highway 1, creating independent fishing villages.',
    fullExplanation: 'Barbados Land Deeds and Conveyance Rolls recorded the gradual subdivision of coastal estates into freehold parcels during the late nineteenth century. Smallholders paid £10 to £25 for coastal road-frontage lots, establishing autonomous seaside hamlets.',
    sources: [
      { title: 'Barbados Department of Archives (Black Rock)', uri: 'https://archives.gov.bb/' },
      { title: 'Registrar of Titles Conveyance Rolls Vol 1898-C', uri: 'https://www.ancestry.com/search/collections/60275/' }
    ]
  }
];
