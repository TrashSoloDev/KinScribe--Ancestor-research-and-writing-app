export type SourceProvider = 'familysearch' | 'ancestry';

export interface RecordSource {
  id: string;
  provider: SourceProvider;
  sourceTitle: string;
  collection: string;
  recordType: string;
  dateFound: string;
  externalUrl: string;
  citationText: string;
  confidence: 'primary' | 'secondary';
  recordDetails?: {
    censusYear?: number;
    sheet?: string;
    enumerationDistrict?: string;
    certificateNumber?: string;
    archiveRoll?: string;
    microfilmRoll?: string;
  };
}

export type EventType = 
  | 'birth' 
  | 'baptism' 
  | 'residence' 
  | 'census' 
  | 'military' 
  | 'marriage' 
  | 'immigration' 
  | 'occupation' 
  | 'death' 
  | 'burial' 
  | 'probate'
  | 'misc';

export interface TimelineFact {
  id: string;
  ancestorId: string;
  eventType: EventType;
  title: string;
  year: number;
  dateStr: string;
  place: string;
  description: string;
  details?: string[];
  sources: RecordSource[];
  isDeduplicated: boolean;
  isStarred?: boolean;
  notes?: string;
}

export interface Ancestor {
  id: string;
  name: string;
  maidenName?: string;
  gender: 'M' | 'F' | 'O';
  birthYear: number;
  deathYear: number | 'Living';
  birthPlace: string;
  deathPlace: string;
  relationship: string;
  generation: number;
  bioSummary: string;
  avatarPlaceholder?: string;
  parents?: string[];
  spouses?: string[];
  children?: string[];
  factsCount?: number;
  treeBranch?: 'Paternal' | 'Maternal';
}

export interface ManuscriptChapter {
  id: string;
  title: string;
  subtitle?: string;
  contentHtml: string;
  wordCount: number;
  updatedAt: number;
  ancestorFocusId?: string;
}

export interface CitationFootnote {
  id: string;
  number: number;
  factId: string;
  ancestorName: string;
  eventTitle: string;
  year: number;
  shortCitation: string;
  fullCitation: string;
  sourceUrl: string;
  provider: SourceProvider;
}

export interface AccountConnectionState {
  familySearch: {
    isConnected: boolean;
    username?: string;
    displayName?: string;
    personCount?: number;
    treeName?: string;
    lastSynced?: string;
  };
  ancestry: {
    isConnected: boolean;
    username?: string;
    displayName?: string;
    treeName?: string;
    recordsCount?: number;
    gedcomFileLoaded?: string;
    lastSynced?: string;
  };
}

export interface ConflictingRecordOption {
  id: string;
  provider: SourceProvider;
  sourceTitle: string;
  recordType: string;
  collection: string;
  dateStr: string;
  year: number;
  place: string;
  description: string;
  details: string[];
  citation: string;
  externalUrl: string;
  confidence: 'primary' | 'secondary';
  rawFactId?: string;
  rollOrCert?: string;
}

export interface RecordConflict {
  id: string;
  ancestorId: string;
  ancestorName: string;
  fieldInConflict: string;
  discrepancyType: 'date' | 'place' | 'occupation' | 'vital';
  discrepancySummary: string;
  recordA: ConflictingRecordOption;
  recordB: ConflictingRecordOption;
  selectedPrimaryId: 'recordA' | 'recordB';
  resolutionNotes?: string;
  status: 'pending' | 'resolved';
  resolvedAt?: string;
}

export interface HistoricalSearchQuery {
  id: string;
  term: string;
  context?: string;
  timestamp: string;
  createdAt: number;
  resultSnippet: string;
  fullExplanation?: string;
  sources: { title: string; uri: string }[];
}

export interface RecentArchivalFact {
  id: string;
  sourceType: 'chat' | 'research' | 'grounding' | 'conflict';
  title: string;
  snippet: string;
  fullText: string;
  sourceCitation?: string;
  timestamp: number;
  domElementId?: string;
}
