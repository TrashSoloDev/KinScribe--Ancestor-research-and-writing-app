import { RecordConflict } from '../types/genealogy';

export const INITIAL_CONFLICTS: RecordConflict[] = [
  {
    id: 'conflict_ancil_birth',
    ancestorId: 'indi_ancil_scott',
    ancestorName: 'Ancil Chesterfield Scott',
    fieldInConflict: 'Birth Date & Year of Birth',
    discrepancyType: 'date',
    discrepancySummary: 'Civil Registry (12 Aug 1918) vs. SS Colombie Passenger Manifest (15 Sep 1917)',
    recordA: {
      id: 'rec_fs_ancil_birth',
      provider: 'familysearch',
      sourceTitle: 'Barbados Civil Registration of Births (1900-1931)',
      recordType: 'Civil Vital Certificate',
      collection: 'Department of Archives, Black Rock, St. Michael',
      dateStr: '12 Aug 1918',
      year: 1918,
      place: 'Fitts Village, St. James Parish, Barbados',
      description: 'Official birth certificate recorded at St. James Civil Registry. Father: Joseph Nathaniel Scott (Cooper & Seine Fisherman), Mother: Sarah Elizabeth Scott (née Ward).',
      details: [
        'Certificate Number: #1409',
        'Registry District "E" (St. James)',
        'Signed by District Registrar Dr. C. H. Alleyne'
      ],
      citation: 'FamilySearch.org: "Barbados Civil Registration 1900-1931," Ancil Chesterfield Scott, 12 Aug 1918; Department of Archives, Black Rock.',
      externalUrl: 'https://www.familysearch.org/search/collection/1920801',
      confidence: 'primary',
      rawFactId: 'fs_ancil_birth',
      rollOrCert: 'Cert #1409, Vol 42'
    },
    recordB: {
      id: 'rec_anc_ancil_manifest',
      provider: 'ancestry',
      sourceTitle: 'French Line SS Colombie Inbound Passenger Manifest to UK',
      recordType: 'Immigration / Passenger Manifest',
      collection: 'UK National Archives Board of Trade Passenger Lists (BT26/1332)',
      dateStr: '15 Sep 1917',
      year: 1917,
      place: 'Holetown & Fitts Village, St. James, Barbados',
      description: 'Passenger manifest lists birth date as 15 Sep 1917 (Age 37 years and 9 months upon disembarkation at Southampton). Occupation listed as Master Carpenter / Shipwright.',
      details: [
        'Vessel: SS Colombie (French Line)',
        'Port of Departure: Bridgetown, Barbados',
        'UK National Archives Reference: BT26/1332'
      ],
      citation: 'Ancestry.com: UK and Ireland, Incoming Passenger Lists, 1878-1960; French Line SS Colombie arriving Southampton June 1955; BT26/1332.',
      externalUrl: 'https://www.ancestry.com/search/collections/1518/',
      confidence: 'secondary',
      rawFactId: 'anc_ancil_passenger_1955',
      rollOrCert: 'Manifest Line #18'
    },
    selectedPrimaryId: 'recordA',
    resolutionNotes: 'Accepted Anglican civil registration (Certificate #1409) as primary authority recorded at time of birth, over secondary self-reported passenger manifest age.',
    status: 'resolved',
    resolvedAt: 'Default Verified'
  },
  {
    id: 'conflict_joseph_marriage',
    ancestorId: 'indi_joseph_scott',
    ancestorName: 'Joseph Nathaniel Scott',
    fieldInConflict: 'Marriage Date & Solemnization Venue',
    discrepancyType: 'date',
    discrepancySummary: 'Anglican Sacramental Register (19 Nov 1915) vs. Colonial Civil Index (24 Oct 1914)',
    recordA: {
      id: 'rec_fs_joseph_marr',
      provider: 'familysearch',
      sourceTitle: 'St. James Parish Church Sacred Register of Marriages',
      recordType: 'Parish Sacramental Register',
      collection: 'Anglican Diocese of Barbados Historical Registers',
      dateStr: '19 Nov 1915',
      year: 1915,
      place: 'St. James Parish Church, Holetown, Barbados',
      description: 'United in Holy Matrimony by Rev. Canon P. A. Farrar. Groom: Joseph Nathaniel Scott (Age 30, Cooper). Bride: Sarah Elizabeth Ward (Age 27, Spinster). Banns published October 1915.',
      details: [
        'Parish Marriage Volume 1915, Page 42',
        'Witnesses: Samuel Thomas Scott & Martha Ward',
        'Ceremony performed in historic 1628 sanctuary'
      ],
      citation: 'FamilySearch.org: Barbados Church Records - Marriages 1854-1925; St. James Parish, Holetown; Record #STJ-1915-42.',
      externalUrl: 'https://www.familysearch.org/search/collection/1920801',
      confidence: 'primary',
      rawFactId: 'fs_joseph_marriage',
      rollOrCert: 'Page 42, Entry #118'
    },
    recordB: {
      id: 'rec_anc_joseph_civil',
      provider: 'ancestry',
      sourceTitle: 'Caribbean Select Marriage Index & Colonial Registry Rolls',
      recordType: 'Civil Vital Index',
      collection: 'Ancestry Caribbean Collections (1813-1950)',
      dateStr: '24 Oct 1914',
      year: 1914,
      place: 'Bridgetown Registry Office, St. Michael, Barbados',
      description: 'Civil marriage registration index entry for Joseph N. Scott and Sarah Ward. Notice of civil intention posted autumn 1914.',
      details: [
        'Registration District "A" (Bridgetown)',
        'Civil Register Roll 1914-A-89'
      ],
      citation: 'Ancestry.com: Caribbean, Select Marriage Index, 1760-1950; District A Civil Registrar, Roll 1914-A-89.',
      externalUrl: 'https://www.ancestry.com/search/collections/60275/',
      confidence: 'secondary',
      rollOrCert: 'Roll 1914-A-89'
    },
    selectedPrimaryId: 'recordA',
    resolutionNotes: 'St. James Church sacramental register verified by parish vestry and family oral history.',
    status: 'pending'
  },
  {
    id: 'conflict_samuel_land',
    ancestorId: 'indi_samuel_scott',
    ancestorName: 'Samuel Thomas Scott',
    fieldInConflict: 'Fitts Village Freehold Land Grant Date & Acreage',
    discrepancyType: 'vital',
    discrepancySummary: 'Registrar of Deeds Conveyance (1898 · 2.5 Acres) vs. Vestry Tax Roll (1895 · 1.75 Acres)',
    recordA: {
      id: 'rec_anc_samuel_deed',
      provider: 'ancestry',
      sourceTitle: 'Barbados Land Deeds & Conveyance Rolls (1850-1920)',
      recordType: 'Legal Deed & Title Conveyance',
      collection: 'Barbados Department of Archives / Registrar of Titles',
      dateStr: '14 May 1898',
      year: 1898,
      place: 'Fitts Village Coastal Tract, St. James Parish, Barbados',
      description: 'Freehold indenture and deed conveyance for 2.5 acres of seaside land along the Highway 1 road reserve. Granted to Samuel Thomas Scott, former agricultural estate laborer.',
      details: [
        'Volume 1898-C, Page 312',
        'Survey Boundary: High water mark eastward to parish ridge road',
        'Official Government Seal affixed'
      ],
      citation: 'Ancestry.com: Barbados Land Deeds and Conveyance Rolls, 1850-1920; Registrar of Titles, Vol 1898-C, p. 312.',
      externalUrl: 'https://www.ancestry.com/search/collections/60275/',
      confidence: 'primary',
      rawFactId: 'anc_samuel_land',
      rollOrCert: 'Vol 1898-C, p. 312'
    },
    recordB: {
      id: 'rec_fs_samuel_vestry',
      provider: 'familysearch',
      sourceTitle: 'St. James Parish Vestry Rate Assessment & Land Rolls',
      recordType: 'Vestry Tax Schedule',
      collection: 'Anglican Parish Vestry Records of Barbados',
      dateStr: '08 Feb 1895',
      year: 1895,
      place: 'Fitts Village, St. James Parish, Barbados',
      description: 'Parish vestry tax assessment lists Samuel Scott as tenant-purchaser of 1.75 acres of beach landing frontage in Fitts Village, assessed for annual roadway levy.',
      details: [
        'Vestry Tax Minute Book 1895, Page 74',
        'Assessed Value: £12 annual rate'
      ],
      citation: 'FamilySearch.org: Barbados Church Records - Parish Vestry Assessment Rolls; St. James Parish, 1895, p. 74.',
      externalUrl: 'https://www.familysearch.org/search/collection/1920801',
      confidence: 'secondary',
      rollOrCert: 'Vestry Book 1895, p. 74'
    },
    selectedPrimaryId: 'recordA',
    resolutionNotes: '',
    status: 'pending'
  },
  {
    id: 'conflict_sarah_birthplace',
    ancestorId: 'indi_sarah_ward',
    ancestorName: 'Sarah Elizabeth Ward Scott',
    fieldInConflict: 'Birth Location Settlement',
    discrepancyType: 'place',
    discrepancySummary: 'Paynes Bay Chapel Register vs. Prospect Coastal Freehold Return',
    recordA: {
      id: 'rec_fs_sarah_birth',
      provider: 'familysearch',
      sourceTitle: 'Paynes Bay Anglican Chapel Registry of Baptisms',
      recordType: 'Chapel Register',
      collection: 'Diocese of Barbados Church Records',
      dateStr: '04 Mar 1888',
      year: 1888,
      place: 'Paynes Bay, St. James Parish, Barbados',
      description: 'Recorded as born at Paynes Bay coastal settlement. Daughter of Arthur Ward (fisherman) and Mary Ward.',
      details: [
        'Chapel Register Page 19',
        'Godparents: Thomas Alleyne & Sarah Cummins'
      ],
      citation: 'FamilySearch.org: Barbados Church Records, Paynes Bay Chapel; Baptisms 1888, Page 19.',
      externalUrl: 'https://www.familysearch.org/search/collection/1920801',
      confidence: 'primary',
      rollOrCert: 'Page 19'
    },
    recordB: {
      id: 'rec_anc_sarah_census',
      provider: 'ancestry',
      sourceTitle: '1891 Barbados Coastal Census & Household Schedule',
      recordType: 'Colonial Census',
      collection: 'Ancestry West Indies Census Manuscripts',
      dateStr: '12 Mar 1888',
      year: 1888,
      place: 'Prospect Village, St. James Parish, Barbados',
      description: 'Household return for Ward family lists Sarah Elizabeth as 3 years of age, born in Prospect Village adjacent to Fitts Village.',
      details: [
        'Sub-District 2, Schedule #84',
        'Head of Household: Arthur Ward (Cooper)'
      ],
      citation: 'Ancestry.com: 1891 Census of Barbados, District E; Prospect Village Tract; Schedule 84.',
      externalUrl: 'https://www.ancestry.com/search/collections/60275/',
      confidence: 'secondary',
      rollOrCert: 'Schedule 84'
    },
    selectedPrimaryId: 'recordA',
    resolutionNotes: 'Paynes Bay Chapel register represents primary ecclesiastical entry at baptism.',
    status: 'resolved',
    resolvedAt: 'Verified'
  },
  {
    id: 'conflict_ancil_trade',
    ancestorId: 'indi_ancil_scott',
    ancestorName: 'Ancil Chesterfield Scott',
    fieldInConflict: 'Trade & Occupational Classification',
    discrepancyType: 'occupation',
    discrepancySummary: 'Master Shipwright (Marine Board License) vs. Seine Fisherman (Parish Banns)',
    recordA: {
      id: 'rec_anc_ancil_license',
      provider: 'ancestry',
      sourceTitle: 'Barbados Marine Board Boatbuilding & Pilot Registry',
      recordType: 'Trade Guild & Commercial License',
      collection: 'Ancestry Historical Trades & Port Registers',
      dateStr: '15 Oct 1938',
      year: 1938,
      place: 'Carlisle Bay & Fitts Village Beach, Barbados',
      description: 'Registered as Master Shipwright and wooden boatbuilder. Authorized to construct 22-foot traditional flying fish sloops and open whaleboats from silverballi and white cedar timber.',
      details: [
        'Marine Board License #BMB-38-092',
        'Yard / Wharf: Fitts Village Beach',
        'Recognized master shipwright of West Coast'
      ],
      citation: 'Ancestry.com: Barbados & West Indies Maritime Licenses; Marine Board Register #BMB-38-092, Ancil C. Scott.',
      externalUrl: 'https://www.ancestry.com/search/collections/60275/',
      confidence: 'primary',
      rawFactId: 'anc_ancil_boatbuilding',
      rollOrCert: 'License #BMB-38-092'
    },
    recordB: {
      id: 'rec_fs_ancil_banns',
      provider: 'familysearch',
      sourceTitle: 'St. James Parish Church Marriage Banns & Vestry Registry',
      recordType: 'Parish Sacramental Record',
      collection: 'Anglican Church Archives of the West Indies',
      dateStr: '19 Nov 1941',
      year: 1941,
      place: 'St. James Parish Church, Holetown, Barbados',
      description: 'Marriage register entry classifies groom Ancil Chesterfield Scott as "Coastal Fisherman & Carpenter" of Fitts Village.',
      details: [
        'Banns Published October-November 1941',
        'Entry STJ-1941-MARR-88'
      ],
      citation: 'FamilySearch.org: Barbados Marriages, 1854-1945; St. James Parish Registers, Record STJ-1941-MARR-88.',
      externalUrl: 'https://www.familysearch.org/search/collection/1920801',
      confidence: 'secondary',
      rollOrCert: 'STJ-1941-MARR-88'
    },
    selectedPrimaryId: 'recordA',
    resolutionNotes: 'The Marine Board License confirms his master boatwright certification, the core theme of his legacy in "The Fitts Village Story".',
    status: 'resolved',
    resolvedAt: 'Verified'
  }
];
