import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  APIProvider, 
  Map as GoogleMapComponent, 
  AdvancedMarker, 
  Pin, 
  InfoWindow 
} from '@vis.gl/react-google-maps';
import { Ancestor, TimelineFact } from '../types/genealogy';
import { 
  MapPin, 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronRight, 
  ChevronLeft, 
  Calendar, 
  Navigation, 
  Compass, 
  Layers, 
  BookOpen, 
  Sparkles, 
  FileText, 
  ExternalLink,
  Waves,
  Church,
  Home,
  Anchor,
  CheckCircle2,
  X
} from 'lucide-react';

export interface JourneyMilestone {
  stepNumber: number;
  fact: TimelineFact;
  lat: number;
  lng: number;
  placeName: string;
  parish: string;
  historicalSignificance: string;
  distanceFromPreviousKm?: number;
}

interface Props {
  ancestors: Ancestor[];
  facts: TimelineFact[];
  selectedAncestorId: string;
  onSelectAncestor: (ancestorId: string) => void;
  onCiteInDraft?: (insertedHtml: string) => void;
  onClose?: () => void;
}

// Registry of historical Barbadian landmarks and parishes
interface LandmarkDefinition {
  name: string;
  parish: string;
  lat: number;
  lng: number;
  significance: string;
}

const BARBADOS_GEO_LOCATIONS: Record<string, LandmarkDefinition> = {
  fitts_village: {
    name: 'Fitts Village Coastal Settlement',
    parish: 'St. James Parish',
    lat: 13.1485,
    lng: -59.6338,
    significance: 'Historic independent beachfront settlement on Highway 1. Center of traditional boatwright craftsmanship and flying fish hauling.'
  },
  st_james_church: {
    name: 'Historic St. James Parish Church (Holetown)',
    parish: 'St. James Parish',
    lat: 13.1867,
    lng: -59.6381,
    significance: 'Consecrated 1628. Ancient parish sanctuary whose sacristy preserved baptism, banns, marriage, and burial rolls.'
  },
  paynes_bay: {
    name: 'Paynes Bay & Freehold Lands',
    parish: 'St. James Parish',
    lat: 13.1652,
    lng: -59.6355,
    significance: 'Protected west coast cove where village crews launched collective seine nets.'
  },
  carlton_tenancy: {
    name: 'Carlton Estate & Tenantries',
    parish: 'St. James Parish',
    lat: 13.1720,
    lng: -59.6150,
    significance: 'Inland sugarcane plantation slopes where 19th-century ancestors lived under agrarian tenancy.'
  },
  carlisle_bay: {
    name: 'Carlisle Bay & Bridgetown Harbour',
    parish: 'St. Michael Parish',
    lat: 13.0950,
    lng: -59.6150,
    significance: 'Colonial deep-water anchorage and Marine Board licensing center for master coastal boatwrights.'
  },
  black_rock: {
    name: 'Barbados Department of Archives (Black Rock)',
    parish: 'St. Michael Parish',
    lat: 13.1220,
    lng: -59.6240,
    significance: 'National archives depository housing parish registers, deeds, and 1921 population census schedules.'
  },
  speightstown: {
    name: 'Speightstown ("Little Bristol") Port',
    parish: 'St. Peter Parish',
    lat: 13.2510,
    lng: -59.6455,
    significance: 'Historic northern wharf connecting west coast fishing sloops with regional Caribbean commerce.'
  },
  prospect: {
    name: 'Prospect & Batts Rock Freehold',
    parish: 'St. James Parish',
    lat: 13.1390,
    lng: -59.6310,
    significance: 'Southern boundary of St. James Parish where Scott and Ward family lineages converged.'
  },
  bridgetown_market: {
    name: 'Bridgetown Careenage & Fish Market',
    parish: 'St. Michael Parish',
    lat: 13.0975,
    lng: -59.6170,
    significance: 'Island trade hub where cooperage hogsheads and coastal catches were exchanged.'
  }
};

// Calculate Haversine distance in km between two lat/lng points
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c * 10) / 10;
}

export const LifeJourneyMap: React.FC<Props> = ({
  ancestors,
  facts,
  selectedAncestorId,
  onSelectAncestor,
  onCiteInDraft,
  onClose
}) => {
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [mapRenderMode, setMapRenderMode] = useState<'google' | 'cartography'>('google');
  const [selectedMilestoneInfo, setSelectedMilestoneInfo] = useState<JourneyMilestone | null>(null);

  const playTimerRef = useRef<number | null>(null);

  // Active ancestor
  const selectedAncestor = useMemo(() => {
    return ancestors.find(a => a.id === selectedAncestorId) || ancestors[0];
  }, [ancestors, selectedAncestorId]);

  // Extract and build chronological journey milestones for active ancestor
  const milestones = useMemo<JourneyMilestone[]>(() => {
    if (!selectedAncestor) return [];

    // Filter ancestor facts and sort chronologically
    const ancestorFacts = facts
      .filter(f => f.ancestorId === selectedAncestor.id)
      .sort((a, b) => a.year - b.year);

    // Coordinate resolution helper
    const resolveCoords = (fact: TimelineFact, index: number): LandmarkDefinition => {
      const placeStr = (fact.place + ' ' + fact.title + ' ' + fact.description).toLowerCase();

      if (placeStr.includes('st. james parish church') || placeStr.includes('holetown')) {
        return BARBADOS_GEO_LOCATIONS.st_james_church;
      }
      if (placeStr.includes('paynes bay')) {
        return BARBADOS_GEO_LOCATIONS.paynes_bay;
      }
      if (placeStr.includes('carlton')) {
        return BARBADOS_GEO_LOCATIONS.carlton_tenancy;
      }
      if (placeStr.includes('carlisle bay') || placeStr.includes('marine board')) {
        return BARBADOS_GEO_LOCATIONS.carlisle_bay;
      }
      if (placeStr.includes('archives') || placeStr.includes('black rock')) {
        return BARBADOS_GEO_LOCATIONS.black_rock;
      }
      if (placeStr.includes('speightstown') || placeStr.includes('st. peter')) {
        return BARBADOS_GEO_LOCATIONS.speightstown;
      }
      if (placeStr.includes('prospect')) {
        return BARBADOS_GEO_LOCATIONS.prospect;
      }
      if (placeStr.includes('bridgetown') || placeStr.includes('careenage')) {
        return BARBADOS_GEO_LOCATIONS.bridgetown_market;
      }

      // Default to Fitts Village with micro-offset based on step index so overlapping points spread nicely
      const base = BARBADOS_GEO_LOCATIONS.fitts_village;
      const offsetLat = (index % 3 - 1) * 0.0035;
      const offsetLng = (Math.floor(index / 3) % 2 - 0.5) * 0.0025;
      return {
        ...base,
        lat: base.lat + offsetLat,
        lng: base.lng + offsetLng
      };
    };

    let prevLat: number | null = null;
    let prevLng: number | null = null;

    return ancestorFacts.map((fact, idx) => {
      const resolved = resolveCoords(fact, idx);
      const dist = prevLat !== null && prevLng !== null
        ? calculateDistanceKm(prevLat, prevLng, resolved.lat, resolved.lng)
        : 0;

      prevLat = resolved.lat;
      prevLng = resolved.lng;

      return {
        stepNumber: idx + 1,
        fact,
        lat: resolved.lat,
        lng: resolved.lng,
        placeName: resolved.name,
        parish: resolved.parish,
        historicalSignificance: resolved.significance,
        distanceFromPreviousKm: dist
      };
    });
  }, [selectedAncestor, facts]);

  // Reset active step when ancestor changes
  useEffect(() => {
    setActiveStepIndex(0);
    setIsPlaying(false);
    if (milestones[0]) {
      setSelectedMilestoneInfo(milestones[0]);
    }
  }, [selectedAncestorId, milestones.length]);

  // Auto-play timeline journey
  useEffect(() => {
    if (!isPlaying) {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
      return;
    }

    playTimerRef.current = window.setInterval(() => {
      setActiveStepIndex(prev => {
        if (prev >= milestones.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        const next = prev + 1;
        setSelectedMilestoneInfo(milestones[next] || null);
        return next;
      });
    }, 2800);

    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, [isPlaying, milestones]);

  const currentMilestone = milestones[activeStepIndex] || milestones[0];

  // Total journey distance
  const totalJourneyKm = useMemo(() => {
    return milestones.reduce((sum, m) => sum + (m.distanceFromPreviousKm || 0), 0);
  }, [milestones]);

  const handleStepSelect = (index: number) => {
    setActiveStepIndex(index);
    setSelectedMilestoneInfo(milestones[index]);
  };

  const handleNextStep = () => {
    if (activeStepIndex < milestones.length - 1) {
      handleStepSelect(activeStepIndex + 1);
    }
  };

  const handlePrevStep = () => {
    if (activeStepIndex > 0) {
      handleStepSelect(activeStepIndex - 1);
    }
  };

  const handleInsertJourneyNote = (milestone: JourneyMilestone) => {
    if (!onCiteInDraft) return;
    const snippetHtml = `
      <blockquote class="journey-map-annotation p-3 my-3 bg-amber-50/80 border-l-4 border-amber-700 rounded-r-lg font-serif text-stone-800 text-sm leading-relaxed shadow-2xs">
        <div class="text-xs uppercase font-bold text-amber-900 tracking-wider mb-1 flex items-center gap-1.5">
          <span>Life Milestone #${milestone.stepNumber} (${milestone.fact.year}): ${milestone.fact.title}</span>
        </div>
        <p class="mb-1">${milestone.fact.description}</p>
        <div class="text-xs text-stone-600 font-sans-ui flex items-center gap-2 pt-1 border-t border-amber-200/60">
          <span>📍 <strong>Location:</strong> ${milestone.placeName} (${milestone.parish})</span>
          <span>·</span>
          <span>Archival Source: ${milestone.fact.sources[0]?.sourceTitle || 'Verified Parish Register'}</span>
        </div>
      </blockquote>
      <p><br/></p>
    `;
    onCiteInDraft(snippetHtml);
  };

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  return (
    <div className="space-y-3 font-sans-ui animate-in fade-in duration-200">
      
      {/* SECTION 1: HEADER & ANCESTOR SELECTOR */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-3 sm:p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-600 text-white rounded-xl shadow-xs">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-base sm:text-lg text-stone-900">
                  Ancestor Life Journey Map
                </h3>
                <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                  Geographic History
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Plotting documented parish events, homesteads, and maritime voyages chronologically across Barbados
              </p>
            </div>
          </div>

          {/* Mode Switcher: Google Maps vs. Historical Cartography */}
          <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-xl border border-stone-200 self-start sm:self-auto text-xs font-semibold">
            <button
              onClick={() => setMapRenderMode('google')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                mapRenderMode === 'google'
                  ? 'bg-white text-stone-900 shadow-2xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
              title="View on Google Maps Platform Satellite & Terrain"
            >
              <Navigation className="w-3.5 h-3.5 text-blue-600" />
              <span>Google Maps</span>
            </button>
            <button
              onClick={() => setMapRenderMode('cartography')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                mapRenderMode === 'cartography'
                  ? 'bg-white text-stone-900 shadow-2xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
              title="View on Historical Barbados Coastal Cartography"
            >
              <Waves className="w-3.5 h-3.5 text-amber-700" />
              <span>Historical Map</span>
            </button>
          </div>
        </div>

        {/* Ancestor Switcher Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
          <span className="text-xs font-bold text-stone-700 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-amber-700" />
            Ancestor:
          </span>
          {ancestors.map(anc => {
            const isSelected = anc.id === selectedAncestor.id;
            return (
              <button
                key={anc.id}
                onClick={() => onSelectAncestor(anc.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-amber-700 text-white shadow-xs font-bold'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200'
                }`}
              >
                <span>{anc.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-amber-900 text-amber-200' : 'bg-stone-200 text-stone-600'
                }`}>
                  {anc.relationship}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: MAP CANVAS CONTAINER */}
      <div className="relative bg-stone-900 rounded-2xl overflow-hidden border border-stone-200/90 shadow-2xs min-h-[460px] sm:min-h-[520px]">
        
        {/* GOOGLE MAPS PLATFORM VIEW */}
        {mapRenderMode === 'google' ? (
          <APIProvider apiKey={apiKey}>
            <div className="w-full h-[460px] sm:h-[520px]">
              <GoogleMapComponent
                mapId="DEMO_MAP_ID"
                internalUsageAttributionIds={["gmp_mcp_codeassist_v1_aistudio"]}
                defaultCenter={{ lat: currentMilestone?.lat || 13.165, lng: currentMilestone?.lng || -59.630 }}
                center={{ lat: currentMilestone?.lat || 13.165, lng: currentMilestone?.lng || -59.630 }}
                defaultZoom={13}
                zoom={13}
                mapTypeId="roadmap"
                gestureHandling="greedy"
                disableDefaultUI={false}
                className="w-full h-full"
              >
                {/* Advanced Markers for each life milestone */}
                {milestones.map((m, idx) => {
                  const isActive = idx === activeStepIndex;
                  return (
                    <AdvancedMarker
                      key={m.fact.id + idx}
                      position={{ lat: m.lat, lng: m.lng }}
                      onClick={() => handleStepSelect(idx)}
                      title={`Step ${m.stepNumber}: ${m.fact.title} (${m.fact.year})`}
                    >
                      <div className={`flex flex-col items-center cursor-pointer transition-transform ${isActive ? 'scale-125 z-30' : 'hover:scale-110'}`}>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-md border-2 ${
                          isActive 
                            ? 'bg-amber-600 text-stone-950 border-white ring-4 ring-amber-400/50' 
                            : 'bg-stone-900 text-white border-stone-300'
                        }`}>
                          {m.stepNumber}
                        </div>
                        <div className="px-1.5 py-0.5 bg-stone-900/90 text-[10px] font-mono text-white rounded mt-0.5 shadow-xs whitespace-nowrap">
                          {m.fact.year}
                        </div>
                      </div>
                    </AdvancedMarker>
                  );
                })}

                {/* InfoWindow for selected milestone */}
                {selectedMilestoneInfo && (
                  <InfoWindow
                    position={{ lat: selectedMilestoneInfo.lat, lng: selectedMilestoneInfo.lng }}
                    onCloseClick={() => setSelectedMilestoneInfo(null)}
                  >
                    <div className="p-1 max-w-[240px] text-stone-900 font-sans-ui space-y-1">
                      <div className="flex items-center gap-1 font-bold text-xs text-amber-900">
                        <span>#{selectedMilestoneInfo.stepNumber}:</span>
                        <span className="truncate">{selectedMilestoneInfo.fact.title}</span>
                      </div>
                      <p className="text-[11px] text-stone-600">
                        {selectedMilestoneInfo.fact.dateStr || selectedMilestoneInfo.fact.year} · {selectedMilestoneInfo.placeName}
                      </p>
                      <p className="text-[11px] text-stone-800 line-clamp-2">
                        {selectedMilestoneInfo.fact.description}
                      </p>
                      <button
                        onClick={() => handleInsertJourneyNote(selectedMilestoneInfo)}
                        className="text-[10px] text-amber-800 hover:text-amber-950 font-bold underline block mt-1"
                      >
                        Cite this location in manuscript →
                      </button>
                    </div>
                  </InfoWindow>
                )}
              </GoogleMapComponent>
            </div>
          </APIProvider>
        ) : (
          /* HISTORICAL CARTOGRAPHY SVG VIEW (Stylized West Coast / Barbados Map) */
          <div className="w-full h-[460px] sm:h-[520px] bg-[#f7f4ec] relative overflow-hidden flex items-center justify-center select-none">
            
            {/* Topographic water tint & parish contours */}
            <svg viewBox="0 0 600 800" className="w-full h-full max-h-[520px]">
              {/* Caribbean Sea Background */}
              <rect width="600" height="800" fill="#eaf2f8" />

              {/* Barbados Island Contour (Stylized West Coast Focus) */}
              <path
                d="M 280 80 
                   C 360 110, 440 220, 480 340 
                   C 510 440, 460 580, 410 680 
                   C 340 760, 240 760, 180 700 
                   C 140 640, 160 520, 180 420 
                   C 190 320, 200 200, 240 110 Z"
                fill="#fcfaf2"
                stroke="#d6cdb5"
                strokeWidth="2"
              />

              {/* St. James Parish Coastal Line (West Coast) */}
              <path
                d="M 210 240 C 205 320, 195 400, 185 480"
                fill="none"
                stroke="#b59f7d"
                strokeWidth="3"
                strokeDasharray="4 2"
              />
              <text x="145" y="360" fill="#786c57" fontSize="12" fontWeight="bold" transform="rotate(-90 145,360)">
                ST. JAMES PARISH COAST (HWY 1)
              </text>

              {/* Connect milestones with animated journey path */}
              {milestones.length > 1 && (
                <path
                  d={milestones.map((m, i) => {
                    // Map lat/lng roughly into SVG canvas coordinates
                    // Barbados approx: lat 13.05 - 13.32, lng -59.65 - -59.42
                    const x = 200 + (m.lng - (-59.64)) * 3000;
                    const y = 600 - (m.lat - 13.08) * 3200;
                    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ')}
                  fill="none"
                  stroke="#d97706"
                  strokeWidth="3"
                  strokeDasharray="6 4"
                  className="animate-pulse"
                />
              )}

              {/* Milestone Location Markers */}
              {milestones.map((m, idx) => {
                const x = 200 + (m.lng - (-59.64)) * 3000;
                const y = 600 - (m.lat - 13.08) * 3200;
                const isActive = idx === activeStepIndex;

                return (
                  <g 
                    key={m.fact.id} 
                    transform={`translate(${x}, ${y})`}
                    className="cursor-pointer"
                    onClick={() => handleStepSelect(idx)}
                  >
                    {isActive && (
                      <circle r="18" fill="#f59e0b" opacity="0.35" className="animate-ping" />
                    )}
                    <circle 
                      r={isActive ? 12 : 9} 
                      fill={isActive ? '#b45309' : '#1c1917'} 
                      stroke="#ffffff" 
                      strokeWidth="2" 
                    />
                    <text 
                      textAnchor="middle" 
                      dy="4" 
                      fill="#ffffff" 
                      fontSize="9" 
                      fontWeight="bold"
                    >
                      {m.stepNumber}
                    </text>
                    <text 
                      x="16" 
                      y="4" 
                      fill="#1c1917" 
                      fontSize="10" 
                      fontWeight="bold"
                      className="bg-white/80"
                    >
                      {m.fact.year}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Historical Map Compass Rose in corner */}
            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs p-2 rounded-xl border border-stone-300 shadow-sm flex items-center gap-1.5 text-xs font-serif text-stone-700">
              <Compass className="w-4 h-4 text-amber-800" />
              <span>Barbados West Coast (St. James)</span>
            </div>
          </div>
        )}

        {/* ACTIVE MILESTONE FLOATING DETAILS CARD (Bottom Overlay) */}
        {currentMilestone && (
          <div className="absolute bottom-2.5 left-2.5 right-2.5 sm:left-4 sm:right-auto sm:max-w-md bg-stone-900/95 text-stone-100 backdrop-blur-md border border-stone-700/80 rounded-2xl p-3.5 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-150">
            <div className="space-y-2">
              
              {/* Step indicator & Event Title */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 min-w-0">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    {currentMilestone.stepNumber}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono-data text-amber-400 font-bold text-xs">
                        {currentMilestone.fact.year}
                      </span>
                      <span className="text-[10px] uppercase font-semibold tracking-wider bg-stone-800 px-1.5 py-0.2 rounded text-stone-300">
                        {currentMilestone.fact.eventType}
                      </span>
                    </div>
                    <h4 className="font-serif font-bold text-sm sm:text-base text-amber-100 truncate">
                      {currentMilestone.fact.title}
                    </h4>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-stone-400 block font-mono-data">
                    Step {currentMilestone.stepNumber} of {milestones.length}
                  </span>
                </div>
              </div>

              {/* Geographic Context */}
              <div className="flex items-center gap-1.5 text-xs text-amber-300 bg-[#28231e] p-2 rounded-xl">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="font-medium truncate">{currentMilestone.placeName}</span>
                <span className="text-stone-400 text-[11px]">({currentMilestone.parish})</span>
              </div>

              {/* Historical Description */}
              <p className="text-xs text-stone-300 leading-relaxed font-serif-book line-clamp-3">
                {currentMilestone.fact.description}
              </p>

              {/* Primary Source Reference */}
              {currentMilestone.fact.sources[0] && (
                <div className="text-[11px] text-stone-400 pt-1 border-t border-stone-800 flex items-center justify-between gap-2">
                  <span className="truncate">
                    Source: {currentMilestone.fact.sources[0].sourceTitle}
                  </span>
                  <a
                    href={currentMilestone.fact.sources[0].externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline shrink-0 inline-flex items-center gap-0.5"
                  >
                    Verify <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-1 gap-2">
                <button
                  onClick={() => handleInsertJourneyNote(currentMilestone)}
                  className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-500 active:scale-95 text-stone-950 font-bold text-xs rounded-lg transition-all flex items-center gap-1 shadow-xs"
                  title="Insert this geographical event into manuscript draft"
                >
                  <FileText className="w-3.5 h-3.5 text-stone-900" />
                  <span>Cite in Manuscript</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={handlePrevStep}
                    disabled={activeStepIndex === 0}
                    className="p-1.5 rounded-lg bg-stone-800 text-stone-300 hover:bg-stone-700 disabled:opacity-40 disabled:pointer-events-none"
                    aria-label="Previous event"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNextStep}
                    disabled={activeStepIndex === milestones.length - 1}
                    className="p-1.5 rounded-lg bg-stone-800 text-stone-300 hover:bg-stone-700 disabled:opacity-40 disabled:pointer-events-none"
                    aria-label="Next event"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: TIMELINE JOURNEY CONTROLS & STEPPER TRACK */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-3 shadow-2xs space-y-2.5">
        
        {/* Playback & Metric Summary Bar */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-3 py-1.5 bg-amber-800 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors min-h-[36px]"
              title={isPlaying ? 'Pause journey animation' : 'Play journey sequence'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
              <span>{isPlaying ? 'Pause Journey' : 'Play Journey'}</span>
            </button>

            <button
              onClick={() => handleStepSelect(0)}
              className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center border border-stone-200"
              title="Reset to birth milestone"
              aria-label="Reset journey"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs text-stone-600 font-mono-data">
            <span>{milestones.length} Life Milestones Documented</span>
            <span className="text-stone-300">·</span>
            <span className="text-amber-800 font-semibold">{totalJourneyKm} km Life Range</span>
          </div>
        </div>

        {/* Horizontal Milestone Scrubber Track */}
        <div className="relative pt-2 pb-1">
          <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar py-1">
            {milestones.map((m, idx) => {
              const isCurrent = idx === activeStepIndex;
              const isPast = idx < activeStepIndex;

              return (
                <button
                  key={m.fact.id}
                  onClick={() => handleStepSelect(idx)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all shrink-0 min-w-[76px] ${
                    isCurrent
                      ? 'bg-amber-100 border border-amber-600 shadow-2xs'
                      : isPast
                        ? 'bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200'
                        : 'bg-white hover:bg-stone-50 text-stone-400 border border-stone-200'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isCurrent 
                      ? 'bg-amber-700 text-white shadow-xs' 
                      : isPast 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-stone-200 text-stone-600'
                  }`}>
                    {m.stepNumber}
                  </div>
                  <span className="font-bold text-xs text-stone-900 font-mono-data">
                    {m.fact.year}
                  </span>
                  <span className="text-[10px] text-stone-500 capitalize truncate max-w-[64px]">
                    {m.fact.eventType}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
};
