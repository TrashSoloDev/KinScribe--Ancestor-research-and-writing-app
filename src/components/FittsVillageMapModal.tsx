import React, { useState } from 'react';
import { MapPin, Compass, Navigation, Waves, Church, Anchor, Home, FileText, Check, X, Info } from 'lucide-react';

interface Landmark {
  id: string;
  name: string;
  type: 'homestead' | 'boatyard' | 'church' | 'plantation' | 'archive' | 'beach';
  parish: string;
  coordinateDesc: string;
  historicalSignificance: string;
  associatedAncestors: string[];
  bookExcerpt: string;
  iconType: 'home' | 'anchor' | 'church' | 'plantation' | 'archive' | 'waves';
}

const FITTS_VILLAGE_LANDMARKS: Landmark[] = [
  {
    id: 'lm_samuel_homestead',
    name: 'Samuel Scott Freehold Parcel (1898)',
    type: 'homestead',
    parish: 'St. James Parish (Highway 1)',
    coordinateDesc: 'Fitts Village Seaside Strip, bounded by high-water sea mark',
    historicalSignificance: 'One of the earliest recorded independent freehold purchases along the coast by an emancipated family. A half-acre of coral shelf and white sand that marked the transition from plantation tenancy to seaside autonomy.',
    associatedAncestors: ['Samuel Thomas Scott (1852–1926)', 'Joseph Nathaniel Scott'],
    bookExcerpt: 'In 1898, Samuel Thomas Scott secured our family\'s freehold title along the Fitts Village coast, laying down roots between the public highway and the high-tide line of the Caribbean Sea.',
    iconType: 'home'
  },
  {
    id: 'lm_ancil_boatyard',
    name: 'Ancil Scott Boatbuilding Yard & Launch',
    type: 'boatyard',
    parish: 'Fitts Village Beach',
    coordinateDesc: 'Sheltered cove just off the main road, south of Paynes Bay',
    historicalSignificance: 'The beachfront workshop where master shipwright Ancil Scott built open 22-foot flying fish sloops and whaleboats using steam-bent native white cedar ribs and mahogany transoms.',
    associatedAncestors: ['Ancil Chesterfield Scott (1918–1998)', 'Ward Scott (Author)'],
    bookExcerpt: 'At the Fitts Village beachfront boatyard, the scent of fresh wood shavings and pine pitch mingled with the salty trade winds as Ancil Scott shaped hulls for the west coast fishing fleet.',
    iconType: 'anchor'
  },
  {
    id: 'lm_st_james_church',
    name: 'Historic St. James Parish Church',
    type: 'church',
    parish: 'Holetown, St. James Parish',
    coordinateDesc: 'Historic coastal sanctuary founded 1628, oldest church in Barbados',
    historicalSignificance: 'The sacred heart of the parish where generations of Scott, Alleyne, Baird, and Ward families were baptized, registered in colonial registers, wed by Anglican rites, and interred in the seaside churchyard.',
    associatedAncestors: ['Joseph Nathaniel Scott', 'Sarah Ward Scott', 'Ancil Scott', 'Evelyn Alleyne Scott'],
    bookExcerpt: 'For over three centuries, the bell of St. James Parish Church in Holetown called our family to worship, its stone aisles witnessing our ancestors’ baptisms, marriages, and final homegoings.',
    iconType: 'church'
  },
  {
    id: 'lm_carlton_plantation',
    name: 'Carlton Estate & Tenantries',
    type: 'plantation',
    parish: 'Inland St. James Parish',
    coordinateDesc: 'Sloping sugarcane hills overlooking the western coastline',
    historicalSignificance: 'The sugar plantation lands where nineteenth-century laborers worked under the apprenticeship and tenantry systems before migrating downhill toward the saltwater fishing settlements.',
    associatedAncestors: ['Samuel Thomas Scott', 'Hester Gooding'],
    bookExcerpt: 'On the inland slopes of Carlton Estate, our ancestors labored in the sugarcane fields before claiming their independence along the sparkling waters of Fitts Village.',
    iconType: 'plantation'
  },
  {
    id: 'lm_paynes_bay_seine',
    name: 'Paynes Bay & Fitts Village Seine Hauls',
    type: 'beach',
    parish: 'St. James Coastal Strip',
    coordinateDesc: 'Calm Caribbean bay between Sandy Lane and Fitts Village',
    historicalSignificance: 'The communal fishing grounds where cooper Joseph Scott and village crews hauled massive seine nets, capturing schools of jacks, barracuda, and flying fish to feed coastal families.',
    associatedAncestors: ['Joseph Nathaniel Scott', 'Ancil Chesterfield Scott'],
    bookExcerpt: 'When the cry of "Seine coming in!" echoed across Paynes Bay and Fitts Village, every hand rushed to the water to haul the laden nets onto the warm sand.',
    iconType: 'waves'
  },
  {
    id: 'lm_barbados_archives',
    name: 'Barbados Department of Archives',
    type: 'archive',
    parish: 'Black Rock, St. Michael Parish',
    coordinateDesc: 'National Archives Depository (lazaretto grounds), just south of St. James',
    historicalSignificance: 'The archival vault housing the microfilms of St. James Parish Church registers (1637–1984), colonial deeds, censuses, and slave compensation registers essential to reconstructing our family pedigree.',
    associatedAncestors: ['Ward Scott (Author & Archival Researcher)'],
    bookExcerpt: 'Within the cool stone reading rooms of the Barbados Archives at Black Rock, the handwritten ink entries of colonial parish registers brought our ancestors’ names back to life.',
    iconType: 'archive'
  }
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onInsertExcerpt: (text: string) => void;
}

export const FittsVillageMapModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onInsertExcerpt
}) => {
  const [selectedLandmark, setSelectedLandmark] = useState<Landmark>(FITTS_VILLAGE_LANDMARKS[0]);
  const [copiedNotification, setCopiedNotification] = useState(false);

  if (!isOpen) return null;

  const handleInsert = (excerpt: string) => {
    onInsertExcerpt(`<p><em>${excerpt}</em></p>`);
    setCopiedNotification(true);
    setTimeout(() => {
      setCopiedNotification(false);
      onClose();
    }, 900);
  };

  const renderIcon = (type: Landmark['iconType']) => {
    switch (type) {
      case 'home': return <Home className="w-4 h-4 text-amber-700" />;
      case 'anchor': return <Anchor className="w-4 h-4 text-blue-700" />;
      case 'church': return <Church className="w-4 h-4 text-purple-700" />;
      case 'plantation': return <Compass className="w-4 h-4 text-emerald-700" />;
      case 'waves': return <Waves className="w-4 h-4 text-cyan-700" />;
      case 'archive': return <FileText className="w-4 h-4 text-stone-700" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs">
      <div className="bg-white max-w-4xl w-full rounded-2xl shadow-2xl border border-stone-300 flex flex-col max-h-[92vh] overflow-hidden text-stone-900 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-amber-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-700 text-white flex items-center justify-center shadow-sm">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold font-serif-book text-stone-900 text-lg">
                Fitts Village & St. James Ancestral Land Map
              </h3>
              <p className="text-xs text-stone-600">
                Interactive coastal landmarks connecting Scott, Baird, Alleyne & Ward families along Highway 1
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Split Map & Landmark Detail */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
          
          {/* Left Column: Stylized Coastal Strip Map (Barbados West Coast / Highway 1) */}
          <div className="md:col-span-6 bg-sky-50/60 p-4 border-r border-stone-200 flex flex-col justify-between overflow-y-auto relative">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-sky-950 uppercase tracking-wider">
                <Waves className="w-4 h-4 text-sky-600" />
                <span>Platinum Coast / Caribbean Sea</span>
              </div>
              <span className="text-[11px] font-mono text-stone-500">St. James Parish, Barbados</span>
            </div>

            {/* Stylized Coastal Highway 1 diagram with clickable pins */}
            <div className="relative bg-white/80 backdrop-blur-xs border border-sky-200 rounded-xl p-3 my-2 shadow-inner space-y-2.5">
              
              {/* North Marker */}
              <div className="text-center text-[10px] font-bold text-stone-400 uppercase tracking-widest border-b border-stone-100 pb-1">
                ▲ NORTH (TOWARDS SPEIGHTSTOWN)
              </div>

              {/* Landmarks as Coastal Route Strip */}
              {FITTS_VILLAGE_LANDMARKS.map(lm => {
                const isSelected = selectedLandmark.id === lm.id;
                return (
                  <button
                    key={lm.id}
                    onClick={() => setSelectedLandmark(lm)}
                    className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'bg-amber-100/80 border-amber-500 shadow-sm ring-1 ring-amber-400'
                        : 'bg-stone-50 hover:bg-white border-stone-200 hover:border-amber-300'
                    }`}
                  >
                    <div className="p-1.5 bg-white rounded-lg shadow-2xs shrink-0 mt-0.5">
                      {renderIcon(lm.iconType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-stone-900 truncate">{lm.name}</span>
                        {isSelected && <span className="text-[10px] font-bold text-amber-800 bg-amber-200/80 px-1.5 py-0.5 rounded">Active</span>}
                      </div>
                      <p className="text-[11px] text-stone-600 truncate mt-0.5">{lm.coordinateDesc}</p>
                    </div>
                  </button>
                );
              })}

              {/* South Marker */}
              <div className="text-center text-[10px] font-bold text-stone-400 uppercase tracking-widest border-t border-stone-100 pt-1">
                ▼ SOUTH (TOWARDS BRIDGETOWN & DEPT OF ARCHIVES)
              </div>
            </div>

            <div className="text-[11px] text-stone-500 flex items-center gap-1.5 mt-2">
              <Info className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              <span>Click any pin to inspect deeds, associated ancestors, and book citations.</span>
            </div>
          </div>

          {/* Right Column: Detailed Landmark Inspector & Excerpt Inserter */}
          <div className="md:col-span-6 p-5 flex flex-col justify-between overflow-y-auto bg-white space-y-4">
            
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 mb-1">
                    {selectedLandmark.parish}
                  </span>
                  <h4 className="font-serif-book font-bold text-stone-900 text-lg">
                    {selectedLandmark.name}
                  </h4>
                  <p className="text-xs text-stone-600 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-700" />
                    <span>{selectedLandmark.coordinateDesc}</span>
                  </p>
                </div>
                <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 shrink-0">
                  {renderIcon(selectedLandmark.iconType)}
                </div>
              </div>

              {/* Historical Significance */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-700 leading-relaxed">
                <p className="font-bold text-stone-900 mb-1">Historical & Genealogical Context:</p>
                <p>{selectedLandmark.historicalSignificance}</p>
              </div>

              {/* Associated Ancestors */}
              <div className="space-y-1.5">
                <p className="text-xs font-bold text-stone-800">Connected Family Members:</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedLandmark.associatedAncestors.map((anc, i) => (
                    <span
                      key={i}
                      className="text-xs bg-amber-50 text-amber-900 px-2.5 py-1 rounded-lg border border-amber-200 font-medium"
                    >
                      {anc}
                    </span>
                  ))}
                </div>
              </div>

              {/* Book Excerpt Preview */}
              <div className="space-y-1.5">
                <p className="text-xs font-bold text-stone-800">Ready-to-Insert Manuscript Paragraph:</p>
                <blockquote className="p-3 bg-amber-50/50 border-l-4 border-amber-700 rounded-r-xl font-serif-book italic text-stone-800 text-xs leading-relaxed">
                  "{selectedLandmark.bookExcerpt}"
                </blockquote>
              </div>
            </div>

            {/* Inserter Action Button */}
            <div className="pt-3 border-t border-stone-200 flex items-center justify-between">
              {copiedNotification ? (
                <div className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Inserted into active chapter!</span>
                </div>
              ) : (
                <span className="text-[11px] text-stone-500">Adds geographical context to your book</span>
              )}

              <button
                onClick={() => handleInsert(selectedLandmark.bookExcerpt)}
                className="flex items-center gap-2 px-4 py-2.5 bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Insert Location in Chapter</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
