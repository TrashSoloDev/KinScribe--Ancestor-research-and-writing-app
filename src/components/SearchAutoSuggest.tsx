import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Ancestor, TimelineFact } from '../types/genealogy';
import { 
  Search, 
  User, 
  MapPin, 
  Calendar, 
  X, 
  Clock, 
  Sparkles, 
  ChevronRight 
} from 'lucide-react';

export interface SuggestionItem {
  id: string;
  category: 'ancestor' | 'location' | 'date';
  label: string;
  subtitle: string;
  filterValue: string;
  ancestorId?: string;
  matchScore: number;
}

interface Props {
  value: string;
  onChange: (val: string) => void;
  onSelectAncestor?: (ancestorId: string) => void;
  ancestors: Ancestor[];
  facts: TimelineFact[];
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  autoFocus?: boolean;
  onClose?: () => void;
  isMobile?: boolean;
}

export const SearchAutoSuggest: React.FC<Props> = ({
  value,
  onChange,
  onSelectAncestor,
  ancestors,
  facts,
  placeholder = 'Filter records...',
  className = '',
  inputClassName = '',
  autoFocus = false,
  onClose,
  isMobile = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Index ancestors, locations, and dates from current tree data
  const suggestionsIndex = useMemo(() => {
    const list: Omit<SuggestionItem, 'matchScore'>[] = [];

    // 1. Ancestors
    for (const anc of ancestors) {
      list.push({
        id: `anc_${anc.id}`,
        category: 'ancestor',
        label: anc.name,
        subtitle: `${anc.relationship} (${anc.birthYear}–${anc.deathYear})`,
        filterValue: anc.name,
        ancestorId: anc.id
      });

      // If maiden name or alias exists
      if (anc.maidenName && !anc.name.includes(anc.maidenName)) {
        list.push({
          id: `anc_maiden_${anc.id}`,
          category: 'ancestor',
          label: `${anc.name} (née ${anc.maidenName})`,
          subtitle: `${anc.relationship} · Maiden Name`,
          filterValue: anc.maidenName,
          ancestorId: anc.id
        });
      }
    }

    // 2. Locations & Parishes
    const locationMap = new Map<string, { label: string; count: number; parish: string }>();

    const recordLocation = (rawPlace: string) => {
      if (!rawPlace) return;
      const trimmed = rawPlace.trim();
      if (trimmed.length < 3) return;

      // Extract key phrase before commas or full
      const parts = trimmed.split(',').map(p => p.trim());
      const primary = parts[0];
      const parish = parts.find(p => p.toLowerCase().includes('parish') || p.toLowerCase().includes('st.')) || 'Barbados';

      const key = primary.toLowerCase();
      const existing = locationMap.get(key);
      if (existing) {
        existing.count++;
      } else {
        locationMap.set(key, { label: primary, count: 1, parish });
      }
    };

    for (const f of facts) {
      recordLocation(f.place);
    }
    for (const a of ancestors) {
      recordLocation(a.birthPlace);
      recordLocation(a.deathPlace);
    }

    locationMap.forEach(({ label, count, parish }, key) => {
      list.push({
        id: `loc_${key}`,
        category: 'location',
        label,
        subtitle: `${parish} · ${count} event${count > 1 ? 's' : ''}`,
        filterValue: label
      });
    });

    // 3. Significant Dates & Years
    const yearMap = new Map<number, string[]>();
    for (const f of facts) {
      if (f.year) {
        const events = yearMap.get(f.year) || [];
        if (!events.includes(f.title) && events.length < 2) {
          events.push(f.title);
        }
        yearMap.set(f.year, events);
      }
    }

    yearMap.forEach((eventTitles, year) => {
      list.push({
        id: `year_${year}`,
        category: 'date',
        label: String(year),
        subtitle: eventTitles.join(', ') || 'Recorded Event',
        filterValue: String(year)
      });
    });

    return list;
  }, [ancestors, facts]);

  // Compute matched suggestions as user types
  const filteredSuggestions = useMemo<SuggestionItem[]>(() => {
    const q = value.trim().toLowerCase();

    // If query is empty, show top helpful family tree suggestions
    if (!q) {
      const initialAncestors = suggestionsIndex
        .filter(s => s.category === 'ancestor')
        .slice(0, 3);
      const initialLocations = suggestionsIndex
        .filter(s => s.category === 'location')
        .slice(0, 2);
      const initialDates = suggestionsIndex
        .filter(s => s.category === 'date')
        .slice(0, 2);

      return [...initialAncestors, ...initialLocations, ...initialDates].map(item => ({
        ...item,
        matchScore: 1
      }));
    }

    const matched: SuggestionItem[] = [];

    for (const item of suggestionsIndex) {
      const labelLower = item.label.toLowerCase();
      const subLower = item.subtitle.toLowerCase();

      let score = 0;
      if (labelLower === q) {
        score = 100;
      } else if (labelLower.startsWith(q)) {
        score = 80;
      } else if (labelLower.includes(q)) {
        score = 50;
      } else if (subLower.includes(q)) {
        score = 30;
      }

      if (score > 0) {
        matched.push({
          ...item,
          matchScore: score
        });
      }
    }

    // Sort by match score descending, limit to 8
    matched.sort((a, b) => b.matchScore - a.matchScore);
    return matched.slice(0, 8);
  }, [value, suggestionsIndex]);

  // Handle outside clicks to close suggestion dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        if (isMobile) onClose?.();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMobile, onClose]);

  const handleSelect = (item: SuggestionItem) => {
    onChange(item.filterValue);
    if (item.ancestorId && onSelectAncestor) {
      onSelectAncestor(item.ancestorId);
    }
    setIsOpen(false);
    setHighlightedIndex(-1);
    if (onClose && isMobile) {
      // Keep open on mobile if filtering, or keep search active
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || filteredSuggestions.length === 0) {
      if (e.key === 'ArrowDown') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev < filteredSuggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : filteredSuggestions.length - 1));
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && highlightedIndex < filteredSuggestions.length) {
        e.preventDefault();
        handleSelect(filteredSuggestions[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setHighlightedIndex(-1);
      if (isMobile) onClose?.();
    }
  };

  // Helper to highlight matching text in labels
  const renderHighlighted = (text: string, query: string) => {
    if (!query.trim()) return <span>{text}</span>;
    const q = query.trim();
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return <span>{text}</span>;

    const before = text.slice(0, idx);
    const match = text.slice(idx, idx + q.length);
    const after = text.slice(idx + q.length);

    return (
      <span>
        {before}
        <strong className="text-amber-700 bg-amber-100 px-0.5 rounded font-bold">
          {match}
        </strong>
        {after}
      </span>
    );
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Search Input Bar */}
      <div className="relative flex items-center w-full">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={e => {
            onChange(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          autoFocus={autoFocus}
          placeholder={placeholder}
          aria-autocomplete="list"
          aria-expanded={isOpen}
          className={`w-full pl-8 pr-16 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-stone-900 placeholder:text-stone-400 ${inputClassName}`}
        />

        {/* Clear Button */}
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange('');
              inputRef.current?.focus();
            }}
            className="absolute right-8 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700"
            title="Clear search"
            aria-label="Clear search"
          >
            <X className="w-3 h-3" />
          </button>
        )}

        {/* Mobile close button if provided */}
        {isMobile && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-stone-500 hover:text-stone-800"
          >
            Close
          </button>
        )}
      </div>

      {/* Auto-suggest Dropdown Menu */}
      {isOpen && (
        <div 
          className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-stone-300 rounded-2xl shadow-2xl z-50 overflow-hidden text-xs text-stone-800 animate-in fade-in zoom-in-95 duration-100 max-h-80 overflow-y-auto min-w-[280px]"
          role="listbox"
        >
          {/* Header indicator */}
          <div className="px-3 py-1.5 bg-stone-50 border-b border-stone-200/80 flex items-center justify-between text-[11px] text-stone-500 font-medium">
            <span className="flex items-center gap-1 font-semibold text-stone-700">
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span>{value.trim() ? 'Matching Tree Data' : 'Suggested Searches'}</span>
            </span>
            <span className="text-[10px] text-stone-400">
              {filteredSuggestions.length} suggestions
            </span>
          </div>

          {filteredSuggestions.length === 0 ? (
            <div className="p-4 text-center text-stone-400">
              <p className="font-semibold text-stone-600">No suggestions found</p>
              <p className="text-[11px] mt-0.5">Try searching for an ancestor name, parish, or decade.</p>
            </div>
          ) : (
            <div className="py-1 divide-y divide-stone-100">
              {filteredSuggestions.map((item, idx) => {
                const isHighlighted = idx === highlightedIndex;

                let icon = <User className="w-3.5 h-3.5 text-blue-600" />;
                if (item.category === 'location') {
                  icon = <MapPin className="w-3.5 h-3.5 text-amber-700" />;
                } else if (item.category === 'date') {
                  icon = <Calendar className="w-3.5 h-3.5 text-emerald-700" />;
                }

                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    role="option"
                    aria-selected={isHighlighted}
                    className={`px-3 py-2 flex items-center justify-between gap-2.5 cursor-pointer transition-colors ${
                      isHighlighted ? 'bg-amber-50 text-stone-900' : 'hover:bg-stone-50 text-stone-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-6 h-6 rounded-lg bg-stone-100 flex items-center justify-center shrink-0 border border-stone-200/70">
                        {icon}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-xs truncate">
                          {renderHighlighted(item.label, value)}
                        </div>
                        <div className="text-[10px] text-stone-500 truncate">
                          {item.subtitle}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 text-stone-400">
                      <span className="text-[10px] font-mono-data uppercase bg-stone-100 px-1 py-0.2 rounded text-stone-500">
                        {item.category}
                      </span>
                      <ChevronRight className="w-3 h-3 text-stone-400" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Senior / Keyboard Footer Tip */}
          <div className="px-3 py-1 bg-stone-50 border-t border-stone-200/60 text-[10px] text-stone-400 flex items-center justify-between">
            <span>Use ↑ ↓ to navigate, Enter to select</span>
            <span>Esc to close</span>
          </div>
        </div>
      )}
    </div>
  );
};
