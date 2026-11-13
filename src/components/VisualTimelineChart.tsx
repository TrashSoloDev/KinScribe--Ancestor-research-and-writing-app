import React, { useState } from 'react';
import { TimelineFact, Ancestor } from '../types/genealogy';
import { 
  ResponsiveContainer, 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  ZAxis, 
  Tooltip, 
  ReferenceLine,
  Cell
} from 'recharts';
import { 
  Calendar, 
  Star, 
  Sparkles, 
  ChevronRight, 
  ChevronDown, 
  MapPin, 
  Activity, 
  ZoomIn, 
  ZoomOut,
  Info
} from 'lucide-react';

interface Props {
  facts: TimelineFact[];
  ancestor: Ancestor;
  onSelectFact: (factId: string) => void;
  selectedFactId?: string | null;
  starredFactIds?: string[];
  onToggleStarFact?: (factId: string) => void;
}

interface TimelinePoint {
  id: string;
  year: number;
  yLevel: number;
  title: string;
  eventType: string;
  place: string;
  isDeduplicated: boolean;
  isStarred: boolean;
  provider: 'both' | 'familysearch' | 'ancestry';
  fact: TimelineFact;
}

export const VisualTimelineChart: React.FC<Props> = ({
  facts,
  ancestor,
  onSelectFact,
  selectedFactId,
  starredFactIds = [],
  onToggleStarFact
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activePoint, setActivePoint] = useState<TimelinePoint | null>(null);

  if (!facts || facts.length === 0) return null;

  // Calculate year range
  const years = facts.map(f => f.year);
  const minYear = Math.min(...years, ancestor.birthYear || 1850);
  const maxYear = typeof ancestor.deathYear === 'number' 
    ? Math.max(...years, ancestor.deathYear) 
    : Math.max(...years, 2000);

  const startDomain = Math.floor((minYear - 4) / 10) * 10;
  const endDomain = Math.ceil((maxYear + 4) / 10) * 10;

  // Stagger overlapping years along the vertical axis (yLevels 1 to 4)
  // so closely spaced events don't obscure each other!
  const sortedFacts = [...facts].sort((a, b) => a.year - b.year);
  const yearBucketCounts: Record<number, number> = {};

  const chartData: TimelinePoint[] = sortedFacts.map((fact) => {
    const hasFS = fact.sources.some(s => s.provider === 'familysearch');
    const hasAncestry = fact.sources.some(s => s.provider === 'ancestry');
    const provider = (hasFS && hasAncestry) ? 'both' : hasFS ? 'familysearch' : 'ancestry';
    const isStarred = starredFactIds.includes(fact.id) || Boolean(fact.isStarred);

    const bucketKey = Math.floor(fact.year / 2);
    const countInBucket = yearBucketCounts[bucketKey] || 0;
    yearBucketCounts[bucketKey] = countInBucket + 1;

    // Alternate yLevel between 1, 2, 3, 4 for visual rhythm
    const yLevel = (countInBucket % 4) + 1;

    return {
      id: fact.id,
      year: fact.year,
      yLevel,
      title: fact.title,
      eventType: fact.eventType,
      place: fact.place,
      isDeduplicated: fact.isDeduplicated,
      isStarred,
      provider,
      fact
    };
  });

  const getColor = (pt: TimelinePoint) => {
    if (pt.isStarred) return '#D97706'; // Amber 600
    if (pt.isDeduplicated || pt.provider === 'both') return '#B45309'; // Warm Amber Brown
    if (pt.provider === 'familysearch') return '#0284C7'; // Blue 600
    return '#16A34A'; // Emerald 600
  };

  const getCustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const pt: TimelinePoint = payload[0].payload;
    return (
      <div className="bg-stone-900 text-white p-3 rounded-xl shadow-xl border border-stone-700 max-w-xs text-xs space-y-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between gap-2 border-b border-stone-800 pb-1.5">
          <span className="font-mono-data font-bold text-amber-400 text-sm">{pt.year}</span>
          <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-stone-800 text-stone-300">
            {pt.eventType}
          </span>
        </div>
        <h5 className="font-bold text-stone-100 font-serif-book leading-snug">{pt.title}</h5>
        <div className="flex items-center gap-1 text-[11px] text-stone-400">
          <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
          <span className="truncate">{pt.place}</span>
        </div>
        <div className="flex items-center justify-between pt-1 text-[10px] text-stone-400 border-t border-stone-800/80">
          <span className={pt.provider === 'both' ? 'text-amber-300 font-semibold' : pt.provider === 'familysearch' ? 'text-blue-300' : 'text-emerald-300'}>
            {pt.provider === 'both' ? 'FamilySearch & Ancestry' : pt.provider === 'familysearch' ? 'FamilySearch.org' : 'Ancestry.com'}
          </span>
          {pt.isStarred && (
            <span className="text-amber-400 font-bold flex items-center gap-0.5">
              <Star className="w-2.5 h-2.5 fill-amber-400" /> Starred
            </span>
          )}
        </div>
        <div className="text-[10px] text-amber-200/90 font-medium pt-0.5 text-center">
          Click point to jump to this record ↓
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden transition-all">
      {/* Top Header with Expand/Collapse & Quick Legend */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-4 py-3 bg-gradient-to-r from-stone-50 via-amber-50/40 to-stone-50 border-b border-stone-200 cursor-pointer flex flex-wrap items-center justify-between gap-3 select-none"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-700 text-white flex items-center justify-center shadow-xs">
            <Activity className="w-4 h-4 text-amber-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif-book font-bold text-sm text-stone-900">
                Visual Life Timeline: {ancestor.name}
              </h3>
              <span className="text-[11px] font-mono-data bg-stone-200 text-stone-700 px-2 py-0.2 rounded-full font-semibold">
                {minYear}–{typeof ancestor.deathYear === 'number' ? ancestor.deathYear : 'Living'}
              </span>
            </div>
            <p className="text-xs text-stone-500">
              Interactive horizontal axis mapping {facts.length} milestone events and life discoveries
            </p>
          </div>
        </div>

        {/* Legend & Toggle */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-[11px] text-stone-600">
            <span className="flex items-center gap-1 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block shadow-2xs" />
              Deduplicated ({chartData.filter(d => d.provider === 'both').length})
            </span>
            <span className="flex items-center gap-1 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0284C7] inline-block shadow-2xs" />
              FamilySearch
            </span>
            <span className="flex items-center gap-1 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A] inline-block shadow-2xs" />
              Ancestry
            </span>
            <span className="flex items-center gap-1 font-medium text-amber-800">
              <Star className="w-3 h-3 fill-amber-500 text-amber-600" />
              Starred ({chartData.filter(d => d.isStarred).length})
            </span>
          </div>

          <div className="p-1 rounded-md text-stone-500 hover:text-stone-900 hover:bg-stone-200/60 transition-colors">
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* Expanded Chart Body */}
      {isExpanded && (
        <div className="p-4 sm:p-5 space-y-3">
          <div className="h-44 sm:h-48 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                <XAxis 
                  type="number" 
                  dataKey="year" 
                  name="Year" 
                  domain={[startDomain, endDomain]} 
                  tickCount={Math.min(12, Math.max(5, Math.round((endDomain - startDomain) / 10) + 1))}
                  stroke="#78716c"
                  tick={{ fontSize: 11, fontFamily: 'monospace', fill: '#44403c' }}
                  tickLine={{ stroke: '#a8a29e' }}
                  axisLine={{ stroke: '#a8a29e', strokeWidth: 1.5 }}
                />
                
                <YAxis 
                  type="number" 
                  dataKey="yLevel" 
                  domain={[0.5, 4.5]} 
                  hide 
                />

                <ZAxis range={[220, 240]} />

                <Tooltip 
                  content={getCustomTooltip} 
                  cursor={{ strokeDasharray: '3 3', stroke: '#cbd5e1' }}
                />

                {/* Reference timeline baseline */}
                <ReferenceLine y={2.5} stroke="#e7e5e4" strokeWidth={2} />

                {/* Birth Reference Line */}
                {ancestor.birthYear && (
                  <ReferenceLine 
                    x={ancestor.birthYear} 
                    stroke="#10b981" 
                    strokeDasharray="4 4" 
                    label={{ value: 'Birth', position: 'top', fill: '#059669', fontSize: 10, fontWeight: 700 }} 
                  />
                )}

                {/* Death Reference Line */}
                {typeof ancestor.deathYear === 'number' && (
                  <ReferenceLine 
                    x={ancestor.deathYear} 
                    stroke="#78716c" 
                    strokeDasharray="4 4" 
                    label={{ value: 'Passed', position: 'top', fill: '#57534e', fontSize: 10, fontWeight: 700 }} 
                  />
                )}

                <Scatter 
                  name="Life Events" 
                  data={chartData} 
                  onClick={(pt: any) => {
                    if (pt && pt.id) {
                      onSelectFact(pt.id);
                      setActivePoint(pt);
                    }
                  }}
                  className="cursor-pointer"
                >
                  {chartData.map((entry, index) => {
                    const isSelected = selectedFactId === entry.id;
                    const fill = getColor(entry);
                    return (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={fill}
                        stroke={isSelected ? '#1c1917' : entry.isStarred ? '#78350f' : '#ffffff'}
                        strokeWidth={isSelected ? 3 : 2}
                        className="transition-transform duration-200 hover:scale-125"
                      />
                    );
                  })}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* Micro Card of Clicked Timeline Event with Jump Button */}
          {activePoint && (
            <div className="p-3 bg-amber-50/70 border border-amber-300 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-in fade-in duration-200">
              <div className="flex items-start gap-2.5">
                <span className="font-mono-data font-bold text-sm bg-amber-200 text-amber-950 px-2 py-0.5 rounded shrink-0">
                  {activePoint.year}
                </span>
                <div>
                  <h4 className="font-bold text-stone-900 font-serif-book text-sm">
                    {activePoint.title}
                  </h4>
                  <div className="flex items-center gap-2 text-stone-600 mt-0.5">
                    <span>{activePoint.place}</span>
                    <span aria-hidden="true">·</span>
                    <span className="capitalize">{activePoint.eventType} event</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {onToggleStarFact && (
                  <button
                    onClick={() => onToggleStarFact(activePoint.id)}
                    className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 border transition-colors ${
                      activePoint.isStarred
                        ? 'bg-amber-100 text-amber-950 border-amber-400'
                        : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${activePoint.isStarred ? 'fill-amber-500 text-amber-600' : 'text-stone-400'}`} />
                    <span>{activePoint.isStarred ? 'Starred' : 'Star Discovery'}</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    const el = document.getElementById(`timeline_fact_${activePoint.id}`);
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      el.classList.add('ring-4', 'ring-amber-400');
                      setTimeout(() => el.classList.remove('ring-4', 'ring-amber-400'), 2000);
                    }
                  }}
                  className="px-3 py-1 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-lg shadow-2xs flex items-center gap-1"
                >
                  <span>Scroll to Card</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Senior Guide Footnote */}
          <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1 border-t border-stone-100">
            <span className="flex items-center gap-1">
              <Info className="w-3 h-3 text-stone-400" />
              Tip for Grandpa: Hover or tap any colored circle on the axis to view event details and jump straight to that record below!
            </span>
            <span className="hidden md:inline font-mono-data text-stone-400">
              {startDomain} — {endDomain} Axis
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
