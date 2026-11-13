import { Ancestor, TimelineFact, ManuscriptChapter } from '../types/genealogy';

export const INITIAL_ANCESTORS: Ancestor[] = [
  {
    id: 'indi_ward_scott',
    name: 'Ward Scott',
    gender: 'M',
    birthYear: 1944,
    deathYear: 'Living',
    birthPlace: 'Fitts Village, St. James Parish, Barbados',
    deathPlace: 'Living in Barbados',
    relationship: 'Self / Author',
    generation: 1,
    bioSummary: 'Author, historian, and village elder. Co-author of "The Fitt\'s Village Story: From Sugar to Salt" (Amazon). Dedicated to documenting the genealogical heritage and oral histories of St. James Parish families.',
    treeBranch: 'Paternal',
    parents: ['indi_ancil_scott', 'indi_evelyn_alleyne']
  },
  {
    id: 'indi_ancil_scott',
    name: 'Ancil Chesterfield Scott',
    gender: 'M',
    birthYear: 1918,
    deathYear: 1998,
    birthPlace: 'Fitts Village, St. James Parish, Barbados',
    deathPlace: 'St. James Parish, Barbados',
    relationship: 'Father',
    generation: 2,
    bioSummary: 'Master wooden boatwright, coastal flying fish fisherman, and respected Fitts Village community leader. Built traditional Barbadian open-cockpit fishing boats crafted from mahogany and white cedar.',
    treeBranch: 'Paternal',
    spouses: ['indi_evelyn_alleyne'],
    parents: ['indi_joseph_scott', 'indi_sarah_ward']
  },
  {
    id: 'indi_evelyn_alleyne',
    name: 'Evelyn Marguerite Scott',
    maidenName: 'Alleyne',
    gender: 'F',
    birthYear: 1921,
    deathYear: 2005,
    birthPlace: 'Carlton, St. James Parish, Barbados',
    deathPlace: 'Fitts Village, St. James Parish, Barbados',
    relationship: 'Mother',
    generation: 2,
    bioSummary: 'Seamstress, church organist at St. James Parish Church in Holetown, and keeper of oral family genealogies connecting the Alleyne, Baird, and Scott households.',
    treeBranch: 'Maternal',
    spouses: ['indi_ancil_scott']
  },
  {
    id: 'indi_joseph_scott',
    name: 'Joseph Nathaniel Scott',
    gender: 'M',
    birthYear: 1885,
    deathYear: 1961,
    birthPlace: 'Fitts Village, St. James Parish, Barbados',
    deathPlace: 'St. James Parish, Barbados',
    relationship: 'Paternal Grandfather',
    generation: 3,
    bioSummary: 'Cooper, seine-net fisherman, and pioneer of the early independent coastal settlement at Fitts Village. Key figure in the transition from inland plantation labor to maritime seafaring.',
    treeBranch: 'Paternal',
    spouses: ['indi_sarah_ward'],
    parents: ['indi_samuel_scott']
  },
  {
    id: 'indi_sarah_ward',
    name: 'Sarah Elizabeth Ward Scott',
    maidenName: 'Ward',
    gender: 'F',
    birthYear: 1888,
    deathYear: 1969,
    birthPlace: 'Prospect & Paynes Bay, St. James Parish, Barbados',
    deathPlace: 'Fitts Village, St. James Parish, Barbados',
    relationship: 'Paternal Grandmother',
    generation: 3,
    bioSummary: 'Homemaker, market vendor, and herbalist. Traced her lineage to post-emancipation smallholders in St. James and St. Thomas Parishes.',
    treeBranch: 'Paternal',
    spouses: ['indi_joseph_scott']
  },
  {
    id: 'indi_samuel_scott',
    name: 'Samuel Thomas Scott',
    gender: 'M',
    birthYear: 1852,
    deathYear: 1926,
    birthPlace: 'St. James Parish, Barbados',
    deathPlace: 'Fitts Village, St. James Parish, Barbados',
    relationship: 'Great-Grandfather',
    generation: 4,
    bioSummary: 'Born shortly after Emancipation. Secured one of the earliest recorded freehold coastal land grants in Fitts Village, leading his kin away from estate tenancy to establish the seaside family settlement.',
    treeBranch: 'Paternal'
  }
];

/**
 * Raw historical facts from both FamilySearch and Ancestry for Ward Scott's ancestry.
 * Features realistic Barbados Church Records, Parish Registries, Passenger Lists,
 * and civil records with exact deduplication pairings!
 */
export const RAW_HISTORICAL_FACTS: TimelineFact[] = [
  // ----------------------------------------------------
  // ANCIL CHESTERFIELD SCOTT (1918-1998)
  // ----------------------------------------------------

  // BIRTH - from FamilySearch (Barbados Church & Civil Records)
  {
    id: 'fs_ancil_birth',
    ancestorId: 'indi_ancil_scott',
    eventType: 'birth',
    title: 'Civil Registration of Birth - St. James Parish',
    year: 1918,
    dateStr: '12 Aug 1918',
    place: 'Fitts Village, St. James Parish, Barbados',
    description: 'Registered at the St. James Parish Civil Registry. Father: Joseph Nathaniel Scott (Fisherman & Cooper). Mother: Sarah Elizabeth Scott (née Ward). Informant: Dr. C. H. Alleyne.',
    details: ['Registry Volume 42, Page 118', 'Certificate #1409', 'District "E" Registry'],
    sources: [
      {
        id: 'src_fs_ancil_birth',
        provider: 'familysearch',
        sourceTitle: 'Barbados, Civil Registration, 1900-1931 - St. James Parish',
        collection: 'Barbados Department of Archives (Black Rock, St. Michael)',
        recordType: 'Civil Vital Record',
        dateFound: 'May 14, 2024',
        externalUrl: 'https://www.familysearch.org/search/collection/1920801',
        citationText: 'FamilySearch.org: "Barbados, Civil Registration, 1900-1931," database with images, FamilySearch; Ancil Chesterfield Scott, 12 Aug 1918; citing Birth, St. James, Barbados; Department of Archives, Black Rock.',
        confidence: 'primary',
        recordDetails: { certificateNumber: '1409', microfilmRoll: 'BAR-BIRT-1918-STJ' }
      }
    ],
    isDeduplicated: false
  },
  // BIRTH - from Ancestry.com (DUPLICATE TO BE MERGED)
  {
    id: 'anc_ancil_birth',
    ancestorId: 'indi_ancil_scott',
    eventType: 'birth',
    title: 'Caribbean Vital Records Index - St. James, Barbados',
    year: 1918,
    dateStr: 'August 12, 1918',
    place: 'Fitts Village, St. James, Barbados',
    description: 'Birth return for Ancil Chesterfield Scott. Parents: Joseph Scott (Cooper) and Sarah Ward. Location: West Coast Coastal Strip, Fitts Village.',
    details: ['Barbados Vital Archives Series B-18', 'Parish of St. James'],
    sources: [
      {
        id: 'src_anc_ancil_birth',
        provider: 'ancestry',
        sourceTitle: 'Caribbean, Select Birth and Baptism Index, 1721-1930 (Ancestry.com)',
        collection: 'Caribbean Historical Vital Collections',
        recordType: 'Parish / Civil Index',
        dateFound: 'Feb 19, 2024',
        externalUrl: 'https://www.ancestry.com/search/collections/60275/',
        citationText: 'Ancestry.com. Caribbean, Select Birth and Baptism Index, 1721-1930 [database on-line]. Lehi, UT, USA: Ancestry.com Operations, Inc., 2014; Ancil Chesterfield Scott, St. James, Barbados.',
        confidence: 'primary',
        recordDetails: { archiveRoll: 'Vol 42, Entry 1409' }
      }
    ],
    isDeduplicated: false
  },

  // BAPTISM - from FamilySearch (St. James Parish Church, Holetown)
  {
    id: 'fs_ancil_baptism',
    ancestorId: 'indi_ancil_scott',
    eventType: 'baptism',
    title: 'Baptism at St. James Parish Church (Holetown)',
    year: 1918,
    dateStr: '22 Sep 1918',
    place: 'St. James Parish Church, Holetown, Barbados',
    description: 'Baptized by the Reverend Canon P. A. Farrar at historic St. James Parish Church. Godparents: Winston Baird, Arthur Ward, and Martha Alleyne.',
    details: ['Parish Baptism Register Page 44', 'Historic Church founded 1628'],
    sources: [
      {
        id: 'src_fs_ancil_baptism',
        provider: 'familysearch',
        sourceTitle: 'Barbados Church Records, 1637-1887 / 1920s Parish Registers',
        collection: 'Anglican Diocese of Barbados Parish Registers',
        recordType: 'Parish Sacramental Register',
        dateFound: 'Mar 11, 2024',
        externalUrl: 'https://www.familysearch.org/search/collection/1920801',
        citationText: 'FamilySearch.org: Barbados Church Records, Parish of St. James, Holetown; Baptisms 1918, p. 44, Ancil Chesterfield Scott.',
        confidence: 'primary'
      }
    ],
    isDeduplicated: false
  },

  // 1921 BARBADOS CENSUS / LAND SURVEY - from FamilySearch & Ancestry (Deduplicated)
  {
    id: 'fs_ancil_1921_census',
    ancestorId: 'indi_ancil_scott',
    eventType: 'census',
    title: '1921 Barbados Population Schedule - St. James Parish',
    year: 1921,
    dateStr: '24 Apr 1921',
    place: 'Fitts Village, St. James Parish, Barbados',
    description: 'Age 2, residing at the family homestead along the St. James coast road (Highway 1). Household: Joseph Nathaniel Scott (35, Cooper & Seine Fisherman), Sarah Elizabeth (32), and grandfather Samuel Scott (68, Landowner).',
    details: ['District E, Sub-District 3 (Fitts Village coastal tract)', 'House #19'],
    sources: [
      {
        id: 'src_fs_ancil_1921_census',
        provider: 'familysearch',
        sourceTitle: 'Barbados Census of 1921 - St. James District E',
        collection: 'Barbados Government Gazette Population Returns',
        recordType: 'Colonial Census Schedule',
        dateFound: 'Jan 28, 2024',
        externalUrl: 'https://www.familysearch.org/search/collection/1920801',
        citationText: 'FamilySearch.org: "Barbados Census Returns, 1921," District E, St. James Parish; Household of Joseph Scott, Fitts Village.',
        confidence: 'primary'
      }
    ],
    isDeduplicated: false
  },
  {
    id: 'anc_ancil_1921_census',
    ancestorId: 'indi_ancil_scott',
    eventType: 'census',
    title: '1921 West Indies & Caribbean Census Returns',
    year: 1921,
    dateStr: 'April 24, 1921',
    place: 'Fitts Village, St. James, Barbados',
    description: 'Ancil C. Scott, son, age 2. Resident of Fitts Village. Head of family: Joseph Scott (cooperage and fishing). Freehold landholding recorded.',
    details: ['Barbados Archives Collection Microfilm ED-4'],
    sources: [
      {
        id: 'src_anc_ancil_1921_census',
        provider: 'ancestry',
        sourceTitle: 'Caribbean Census & Freehold Rolls, 1891-1931 (Ancestry.com)',
        collection: 'Colonial Land and Census Manuscripts',
        recordType: 'Colonial Census',
        dateFound: 'Mar 18, 2024',
        externalUrl: 'https://www.ancestry.com/search/collections/60275/',
        citationText: 'Ancestry.com. Caribbean Census & Freehold Rolls [database on-line]; St. James Parish, Barbados; Roll 1921-STJ-E.',
        confidence: 'primary'
      }
    ],
    isDeduplicated: false
  },

  // 1938 BOATBUILDING LICENSE & MARITIME GUILD - from Ancestry.com (SINGLE SITE)
  {
    id: 'anc_ancil_boatbuilding',
    ancestorId: 'indi_ancil_scott',
    eventType: 'occupation',
    title: 'Barbados Marine Board Boatbuilding & Pilot Registry',
    year: 1938,
    dateStr: '15 Oct 1938',
    place: 'Carlisle Bay & Fitts Village, Barbados',
    description: 'Apprenticed as master shipwright under coastal boatbuilders of St. James. Registered to construct 22-foot traditional flying fish sloops and open whaleboats. Recognized for cedar rib carpentry.',
    details: ['Marine Board License #BMB-38-092', 'Home Wharf: Fitts Village Beach'],
    sources: [
      {
        id: 'src_anc_ancil_boatbuilding',
        provider: 'ancestry',
        sourceTitle: 'Barbados & West Indies Maritime Licenses & Port Registers, 1880-1950',
        collection: 'Ancestry Historical Trades & Guilds',
        recordType: 'Trade Guild & Commercial License',
        dateFound: 'Apr 12, 2024',
        externalUrl: 'https://www.ancestry.com/search/collections/60275/',
        citationText: 'Ancestry.com. Barbados & West Indies Maritime Licenses [database on-line]; Marine Board Register #BMB-38-092, Ancil C. Scott, Fitts Village.',
        confidence: 'primary'
      }
    ],
    isDeduplicated: false
  },

  // 1941 MARRIAGE - from FamilySearch (St. James Parish Church)
  {
    id: 'fs_ancil_marriage',
    ancestorId: 'indi_ancil_scott',
    eventType: 'marriage',
    title: 'Holy Matrimony to Evelyn Marguerite Alleyne',
    year: 1941,
    dateStr: '19 Nov 1941',
    place: 'St. James Parish Church, Holetown, Barbados',
    description: 'United in Holy Matrimony by Rev. H. G. Emtage. Groom: Ancil Chesterfield Scott (23, Boatwright, Fitts Village). Bride: Evelyn Marguerite Alleyne (20, Seamstress, Carlton, St. James). Witnesses: Winston Baird and Millicent Alleyne.',
    details: ['Parish Marriage Register Volume 1941, Page 88', 'Banns published October 1941'],
    sources: [
      {
        id: 'src_fs_ancil_marriage',
        provider: 'familysearch',
        sourceTitle: 'Barbados Marriages, 1854-1945 (St. James Parish Registers)',
        collection: 'Anglican Church Archives of the West Indies',
        recordType: 'Marriage Certificate',
        dateFound: 'Feb 8, 2024',
        externalUrl: 'https://www.familysearch.org/search/collection/1920801',
        citationText: 'FamilySearch.org: "Barbados Marriages, 1854-1945," database, FamilySearch; Ancil Chesterfield Scott and Evelyn Marguerite Alleyne, 19 Nov 1941; St. James, Barbados.',
        confidence: 'primary',
        recordDetails: { certificateNumber: 'STJ-1941-MARR-88' }
      }
    ],
    isDeduplicated: false
  },
  // 1941 MARRIAGE - from Ancestry.com (DUPLICATE TO BE MERGED)
  {
    id: 'anc_ancil_marriage',
    ancestorId: 'indi_ancil_scott',
    eventType: 'marriage',
    title: 'Caribbean Marriage Index, 1813-1950 (Ancestry.com)',
    year: 1941,
    dateStr: 'November 19, 1941',
    place: 'Parish of St. James, Barbados',
    description: 'Marriage index record for Ancil C. Scott and Evelyn Alleyne. Solemnized at St. James Parish Church.',
    details: ['St. James Church Registry Record 41-112'],
    sources: [
      {
        id: 'src_anc_ancil_marriage',
        provider: 'ancestry',
        sourceTitle: 'Caribbean, Select Marriage Index, 1760-1950 (Ancestry.com)',
        collection: 'Caribbean Vital Index',
        recordType: 'Marriage Index',
        dateFound: 'Mar 24, 2024',
        externalUrl: 'https://www.ancestry.com/search/collections/60275/',
        citationText: 'Ancestry.com. Caribbean, Select Marriage Index, 1760-1950 [database on-line]. Lehi, UT, USA: Ancestry.com Operations, Inc., 2014.',
        confidence: 'primary'
      }
    ],
    isDeduplicated: false
  },

  // 1955 PASSENGER MANIFEST - SS Colombie / UK & North America Diaspora (Ancestry.com)
  {
    id: 'anc_ancil_passenger_1955',
    ancestorId: 'indi_ancil_scott',
    eventType: 'immigration',
    title: 'Passenger Voyage aboard SS Colombie',
    year: 1955,
    dateStr: '04 Jun 1955',
    place: 'Port of Bridgetown, Barbados to Southampton, UK',
    description: 'Travelled aboard the French Line vessel SS Colombie representing Barbadian coastal trades and maritime craft. Listed as Shipwright, age 36. Residence: Fitts Village, St. James, Barbados.',
    details: ['Board of Trade Passenger Lists (Class BT26, Piece 1332)', 'Arrived Southampton June 16, 1955'],
    sources: [
      {
        id: 'src_anc_ancil_pass',
        provider: 'ancestry',
        sourceTitle: 'UK and Ireland, Incoming Passenger Lists, 1878-1960 (Ancestry.com)',
        collection: 'The National Archives of the UK (Kew, Richmond, Surrey)',
        recordType: 'Ship Passenger Manifest',
        dateFound: 'Apr 29, 2024',
        externalUrl: 'https://www.ancestry.com/search/collections/1518/',
        citationText: 'Ancestry.com. UK and Ireland, Incoming Passenger Lists, 1878-1960 [database on-line]. Lehi, UT, USA: Ancestry.com Operations, Inc., 2008; SS Colombie, 1955.',
        confidence: 'primary'
      }
    ],
    isDeduplicated: false
  },

  // 1998 DEATH & BURIAL - from FamilySearch & Ancestry (Deduplicated)
  {
    id: 'fs_ancil_death',
    ancestorId: 'indi_ancil_scott',
    eventType: 'death',
    title: 'Death & Burial in St. James Parish Churchyard',
    year: 1998,
    dateStr: '14 Oct 1998',
    place: 'Fitts Village & Holetown, St. James, Barbados',
    description: 'Passed peacefully at home in Fitts Village, age 80. Buried in the historic beachfront cemetery of St. James Parish Church, Holetown, overlooking the Caribbean Sea.',
    details: ['St. James Churchyard Plot E-14', 'Memorial Service officiated by the Archdeacon'],
    sources: [
      {
        id: 'src_fs_ancil_death',
        provider: 'familysearch',
        sourceTitle: 'Barbados Church Records & Memorial Inscriptions, 1950-2005',
        collection: 'Department of Archives (Barbados)',
        recordType: 'Burial Register & Gravestone Inscription',
        dateFound: 'Jan 15, 2024',
        externalUrl: 'https://www.familysearch.org/search/collection/1920801',
        citationText: 'FamilySearch.org: Barbados Memorial Inscriptions, St. James Parish Church, Holetown; Ancil Chesterfield Scott (1918-1998).',
        confidence: 'primary'
      }
    ],
    isDeduplicated: false
  },
  {
    id: 'anc_ancil_death',
    ancestorId: 'indi_ancil_scott',
    eventType: 'death',
    title: 'Caribbean and Global Cemetery Index - St. James, Barbados',
    year: 1998,
    dateStr: 'October 14, 1998',
    place: 'St. James Parish, Barbados',
    description: 'Ancil C. Scott. Died 14 Oct 1998. Resting at St. James Parish Churchyard, Holetown. Inscription: "Master Builder of Ships and Community."',
    details: ['Cemetery ID: BAR-STJ-004'],
    sources: [
      {
        id: 'src_anc_ancil_death',
        provider: 'ancestry',
        sourceTitle: 'Global, Find a Grave Index for Burials at Sea and other Select Burial Locations (Ancestry.com)',
        collection: 'Ancestry Cemetery Databases',
        recordType: 'Cemetery Index',
        dateFound: 'Mar 2, 2024',
        externalUrl: 'https://www.ancestry.com/search/collections/60541/',
        citationText: 'Ancestry.com. Global, Find a Grave Index [database on-line]; Ancil Chesterfield Scott, St. James Parish Churchyard, Holetown, Barbados.',
        confidence: 'primary'
      }
    ],
    isDeduplicated: false
  },

  // ----------------------------------------------------
  // JOSEPH NATHANIEL SCOTT (1885-1961)
  // ----------------------------------------------------
  {
    id: 'fs_joseph_birth',
    ancestorId: 'indi_joseph_scott',
    eventType: 'birth',
    title: 'Baptismal Registry of St. James Parish Church',
    year: 1885,
    dateStr: '18 Nov 1885',
    place: 'St. James Parish, Barbados',
    description: 'Born to Samuel Thomas Scott (Freehold Laborer) and Rebecca Jordan. Registered in the Anglican baptismal register of St. James.',
    details: ['Volume 28, Page 76', 'Officiating Curate: Rev. W. C. Watson'],
    sources: [
      {
        id: 'src_fs_joseph_birth',
        provider: 'familysearch',
        sourceTitle: 'Barbados Church Records, 1637-1887 (St. James Baptisms 1885)',
        collection: 'FamilySearch International Microfilm Archive',
        recordType: 'Parish Sacramental Record',
        dateFound: 'Feb 12, 2024',
        externalUrl: 'https://www.familysearch.org/search/collection/1920801',
        citationText: 'FamilySearch.org: "Barbados Church Records, 1637-1887," database with images, FamilySearch; Joseph Nathaniel Scott, 18 Nov 1885; St. James Parish, Barbados.',
        confidence: 'primary'
      }
    ],
    isDeduplicated: false
  },
  {
    id: 'anc_joseph_birth',
    ancestorId: 'indi_joseph_scott',
    eventType: 'birth',
    title: 'Barbados Vital Registers - St. James Parish (Ancestry)',
    year: 1885,
    dateStr: 'November 18, 1885',
    place: 'St. James, Barbados',
    description: 'Birth and baptism record for Joseph Nathaniel Scott. Father: Samuel Scott. Mother: Rebecca Jordan.',
    sources: [
      {
        id: 'src_anc_joseph_birth',
        provider: 'ancestry',
        sourceTitle: 'Caribbean, Select Births and Baptisms, 1721-1930 (Ancestry.com)',
        collection: 'Ancestry.com Caribbean Records',
        recordType: 'Parish Record',
        dateFound: 'Mar 15, 2024',
        externalUrl: 'https://www.ancestry.com/search/collections/60275/',
        citationText: 'Ancestry.com. Caribbean, Select Births and Baptisms, 1721-1930; Joseph Nathaniel Scott, 1885.',
        confidence: 'primary'
      }
    ],
    isDeduplicated: false
  },
  {
    id: 'fs_joseph_marriage',
    ancestorId: 'indi_joseph_scott',
    eventType: 'marriage',
    title: 'Marriage to Sarah Elizabeth Ward',
    year: 1915,
    dateStr: '08 Jun 1915',
    place: 'St. James Parish Church, Holetown, Barbados',
    description: 'Married by Banns. Groom: Joseph Nathaniel Scott (29, Cooper). Bride: Sarah Elizabeth Ward (26, Spinster of Prospect). Joining two pioneer families of the St. James coast.',
    details: ['Marriage Record #STJ-1915-42', 'Witnesses: John Baird & Martha Ward'],
    sources: [
      {
        id: 'src_fs_joseph_marriage',
        provider: 'familysearch',
        sourceTitle: 'Barbados Church Records - Marriages 1854-1925',
        collection: 'Barbados Department of Archives',
        recordType: 'Parish Marriage Registry',
        dateFound: 'Apr 7, 2024',
        externalUrl: 'https://www.familysearch.org/search/collection/1920801',
        citationText: 'FamilySearch.org: Barbados Church Records, Parish of St. James; Marriages 1915, p. 12; Joseph N. Scott and Sarah E. Ward.',
        confidence: 'primary'
      }
    ],
    isDeduplicated: false
  },

  // ----------------------------------------------------
  // SAMUEL THOMAS SCOTT (1852-1926)
  // ----------------------------------------------------
  {
    id: 'fs_samuel_birth',
    ancestorId: 'indi_samuel_scott',
    eventType: 'birth',
    title: 'Post-Emancipation Parish Registry of Baptisms',
    year: 1852,
    dateStr: '04 Apr 1852',
    place: 'St. James Parish, Barbados',
    description: 'Baptized at St. James Parish Church. Parents listed as Thomas Scott (Estate Laborer) and Hester Gooding. Born during the formative post-emancipation era of free village development.',
    details: ['Barbados Archives Vol 14, Page 204'],
    sources: [
      {
        id: 'src_fs_samuel_birth',
        provider: 'familysearch',
        sourceTitle: 'Barbados Church Records, 1637-1887 (St. James Baptisms 1852)',
        collection: 'Department of Archives (Black Rock, St. Michael)',
        recordType: 'Anglican Parish Record',
        dateFound: 'May 5, 2024',
        externalUrl: 'https://www.familysearch.org/search/collection/1920801',
        citationText: 'FamilySearch.org: "Barbados Church Records, 1637-1887," database, FamilySearch; Samuel Thomas Scott, 04 Apr 1852, St. James Parish.',
        confidence: 'primary'
      }
    ],
    isDeduplicated: false
  },
  {
    id: 'anc_samuel_land',
    ancestorId: 'indi_samuel_scott',
    eventType: 'misc',
    title: 'Fitts Village Freehold Land Deed & Conveyance',
    year: 1898,
    dateStr: '14 May 1898',
    place: 'Fitts Village, St. James, Barbados',
    description: 'Deed of conveyance registered with the Registrar of Titles in Bridgetown. Conveyed one-half acre parcel of coastal land bounded on the west by the sea and on the east by the public road (Highway 1). Marked the family\'s shift to full independent property ownership.',
    details: ['Barbados Registry of Deeds Volume 1898-C, Page 312'],
    sources: [
      {
        id: 'src_anc_samuel_land',
        provider: 'ancestry',
        sourceTitle: 'Barbados Land Deeds and Conveyance Rolls, 1850-1920',
        collection: 'West India Land & Estate Registry (Ancestry.com)',
        recordType: 'Land Registry Deed',
        dateFound: 'Mar 30, 2024',
        externalUrl: 'https://www.ancestry.com/search/collections/60275/',
        citationText: 'Ancestry.com. Barbados Land Deeds and Conveyance Rolls [database on-line]; Samuel T. Scott, Fitts Village, St. James; Vol 1898-C, p. 312.',
        confidence: 'primary'
      }
    ],
    isDeduplicated: false
  }
];

export const INITIAL_CHAPTERS: ManuscriptChapter[] = [
  {
    id: 'ch_1',
    title: 'Chapter 1: Untitled Chapter',
    subtitle: '',
    wordCount: 0,
    updatedAt: Date.now(),
    contentHtml: ''
  }
];

