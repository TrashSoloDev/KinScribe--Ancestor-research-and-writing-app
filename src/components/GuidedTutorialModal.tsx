import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Lightbulb, 
  UploadCloud, 
  Star, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Sparkles, 
  Check, 
  FileText,
  Compass,
  Mic,
  ArrowRight
} from 'lucide-react';

export interface TutorialStep {
  title: string;
  subtitle: string;
  tabTarget?: 'writer' | 'research';
  badge: string;
  description: string;
  details: string[];
  proTip: string;
  icon: React.ReactNode;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSwitchTab?: (tab: 'writer' | 'research') => void;
  activeTab?: 'writer' | 'research';
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: 'Welcome to KinScribe',
    subtitle: 'A workspace for researching and writing your family history',
    badge: 'Introduction',
    icon: <Sparkles className="w-6 h-6 text-amber-500" />,
    description: 'KinScribe brings your manuscript, family records, and research notes together. This short introduction will show you where the main tools are and what each one does.',
    details: [
      'Manuscript: write chapters, add citations, and export your work.',
      'Genealogy: review ancestors, timelines, sources, and conflicting records.',
      'Search Assistant: open genealogy search results in FamilySearch or Ancestry.'
    ],
    proTip: 'Your work is saved on this device. It is not automatically backed up or synchronized to another device.',
  },
  {
    title: 'Write and organize your book',
    subtitle: 'The Manuscript tab is your writing desk',
    tabTarget: 'writer',
    badge: 'Manuscript',
    icon: <BookOpen className="w-6 h-6 text-blue-700" />,
    description: 'Open chapters from the outline, continue the sample manuscript, or create a new chapter. Your writing is saved automatically on this device.',
    details: [
      'Format text, create chapters, and import supported Word, HTML, Markdown, or text files.',
      'Insert sourced facts into the manuscript as citations.',
      'Export a chapter as PDF or prepare the book for paperback layout.'
    ],
    proTip: 'Use the chapter outline to move between sections. Look for the saved status in the top bar.',
  },
  {
    title: 'Explore family records',
    subtitle: 'The Genealogy tab organizes facts by ancestor and date',
    tabTarget: 'research',
    badge: 'Genealogy',
    icon: <Search className="w-6 h-6 text-emerald-600" />,
    description: 'Choose an ancestor to see their timeline, records, and source details. Switch between chronology, family tree, journey map, and conflict review.',
    details: [
      'Filter facts by place, decade, event, or source; compare records and resolve discrepancies.',
      'Import a family tree from a GEDCOM file exported by a genealogy service.',
      'FamilySearch and Ancestry buttons open their official sign-in pages; KinScribe does not sync those accounts.'
    ],
    proTip: 'Use the source links on a fact to check the original record before relying on it.',
  },
  {
    title: 'Turn discoveries into writing',
    subtitle: 'Keep useful evidence close at hand',
    tabTarget: 'research',
    badge: 'Evidence and ideas',
    icon: <Lightbulb className="w-6 h-6 text-amber-500" />,
    description: 'Research tools help you decide what to revisit and bring selected findings into your manuscript.',
    details: [
      'Star important facts so they are easier to find later.',
      'Review suggested themes and use them to filter records or start a chapter draft.',
      'Use Cite in Book to add a selected record and citation to your writing.'
    ],
    proTip: 'A suggested theme is a writing prompt, not proof. Confirm each claim against its source.',
  },
  {
    title: 'Capture stories and photographs',
    subtitle: 'Companion tools help preserve family memories',
    tabTarget: 'writer',
    badge: 'More tools',
    icon: <Mic className="w-6 h-6 text-amber-700" />,
    description: 'Use the tools menu to record an oral memory, browse the scrapbook, explore the map, or export the finished manuscript.',
    details: [
      'Voice dictation depends on speech-recognition support in the browser or device.',
      'The scrapbook can hold family photos and link them with ancestors.',
      'Use the map and export tools when you need them; online services may require internet access.'
    ],
    proTip: 'You can close this introduction at any time and reopen it later from More Options.',
  }
];

export const GuidedTutorialModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSwitchTab,
  activeTab
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (!isOpen) return null;

  const step = TUTORIAL_STEPS[currentStepIndex];
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === TUTORIAL_STEPS.length - 1;

  const handleNext = () => {
    if (!isLast) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      const nextStep = TUTORIAL_STEPS[nextIdx];
      if (nextStep.tabTarget && onSwitchTab) {
        onSwitchTab(nextStep.tabTarget);
      }
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      const prevStep = TUTORIAL_STEPS[prevIdx];
      if (prevStep.tabTarget && onSwitchTab) {
        onSwitchTab(prevStep.tabTarget);
      }
    }
  };

  const jumpToStep = (index: number) => {
    setCurrentStepIndex(index);
    const target = TUTORIAL_STEPS[index];
    if (target.tabTarget && onSwitchTab) {
      onSwitchTab(target.tabTarget);
    }
  };

  return (
    <div className="guided-intro-enter fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white max-w-2xl w-full rounded-2xl shadow-2xl border border-stone-300 flex flex-col overflow-hidden text-stone-900 max-h-[92vh]">
        
        {/* Top Header & Step Tracker */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-50 via-stone-50 to-amber-100/50 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-600 text-white rounded-xl shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900">
                Guided Introduction
              </span>
              <h2 className="text-sm font-semibold text-stone-700">
                Step {currentStepIndex + 1} of {TUTORIAL_STEPS.length}: {step.badge}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 rounded-lg transition-colors"
            title="Close Introduction"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Dots */}
        <div className="flex items-center gap-1.5 px-6 pt-3 bg-stone-50/50">
          {TUTORIAL_STEPS.map((s, idx) => (
            <button
              key={idx}
              onClick={() => jumpToStep(idx)}
              className={`h-2 rounded-full transition-all flex-1 ${
                idx === currentStepIndex
                  ? 'bg-amber-700 shadow-xs ring-1 ring-amber-600'
                  : idx < currentStepIndex
                    ? 'bg-emerald-500'
                    : 'bg-stone-200 hover:bg-stone-300'
              }`}
              title={`Go to: ${s.title}`}
            />
          ))}
        </div>

        {/* Main Content Area */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-amber-100/80 border border-amber-200 shadow-xs shrink-0">
              {step.icon}
            </div>

            <div className="space-y-1">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                {step.badge}
              </span>
              <h3 className="text-xl sm:text-2xl font-bold font-serif-book text-stone-900 leading-tight">
                {step.title}
              </h3>
              <p className="text-xs sm:text-sm font-medium text-stone-500">
                {step.subtitle}
              </p>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-stone-700 leading-relaxed">
            {step.description}
          </p>

          {/* Bullet Highlights */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/80 space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
              Key Capabilities:
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-stone-700">
              {step.details.map((item, dIdx) => (
                <li key={dIdx} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pro Tip Box */}
          <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Tip for Ward:</strong> {step.proTip}
            </div>
          </div>

          {/* If step targets a specific tab, show quick switch hint */}
          {step.tabTarget && onSwitchTab && activeTab !== step.tabTarget && (
            <div className="flex items-center justify-between p-2.5 bg-blue-50/70 border border-blue-200 rounded-lg text-xs text-blue-900">
              <span>This feature is located on the <strong>{step.tabTarget === 'writer' ? 'My Manuscript Book' : 'Genealogy Research'}</strong> tab.</span>
              <button
                onClick={() => onSwitchTab(step.tabTarget!)}
                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow-2xs shrink-0 flex items-center gap-1"
              >
                <span>Switch Tab</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}

        </div>

        {/* Footer Navigation Buttons */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-3">
          <button
            onClick={handlePrev}
            disabled={isFirst}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-stone-300 text-stone-700 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="text-xs text-stone-500 font-mono-data">
            {currentStepIndex + 1} / {TUTORIAL_STEPS.length}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-2 text-xs font-semibold text-stone-500 hover:text-stone-800"
            >
              Skip Introduction
            </button>
            <button
              onClick={handleNext}
              className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-amber-900 hover:bg-amber-950 text-white flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <span>{isLast ? 'Finish Introduction' : 'Next Step'}</span>
              {!isLast && <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
