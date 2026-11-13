import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Square, Play, Sparkles, Check, X, RotateCcw, Volume2, HelpCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onInsertTranscription: (text: string) => void;
  chapterTitle: string;
}

export const OralHistoryRecorderModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onInsertTranscription,
  chapterTitle
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [speechSupported, setSpeechSupported] = useState(true);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  // Suggested storytelling prompts tailored for Ward Scott
  const STORY_PROMPTS = [
    {
      title: 'Launching the Boats at Dawn',
      prompt: 'Describe what the morning air smelled like on Fitts Village beach when Ancil and the men hauled the wooden boats into the breakers...'
    },
    {
      title: 'Crafting the White Cedar Ribs',
      prompt: 'How did the boatbuilders steam and bend local cedar timbers? What tools did your father use in the boatyard?'
    },
    {
      title: 'The Move From Sugar to Salt',
      prompt: 'Tell the story passed down about how Samuel Scott decided to leave the inland plantation tenancy and buy the seaside half-acre...'
    },
    {
      title: 'Sunday Service at St. James Church',
      prompt: 'What was it like walking up Highway 1 to St. James Parish Church in Holetown for weddings, christenings, and Sunday mornings?'
    }
  ];

  useEffect(() => {
    // Check for browser speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }
  }, []);

  // Timer while recording
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingSeconds(s => s + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordingSeconds(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const startRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. You can type grandfather\'s oral stories directly in the box below!');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        let finalChunk = '';
        let interimChunk = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalChunk += event.results[i][0].transcript + ' ';
          } else {
            interimChunk += event.results[i][0].transcript;
          }
        }

        if (finalChunk) {
          setTranscript(prev => prev + (prev.endsWith(' ') || prev.length === 0 ? '' : ' ') + finalChunk);
        }
        setInterimTranscript(interimChunk);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          alert('Microphone permission was not granted. Please check your browser or Android settings.');
        }
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
        setInterimTranscript('');
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error('Failed to start speech recognition', e);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
    setInterimTranscript('');
  };

  const handleApplyToChapter = () => {
    const textToInsert = (transcript + (interimTranscript ? ' ' + interimTranscript : '')).trim();
    if (!textToInsert) return;
    onInsertTranscription(textToInsert);
    onClose();
    setTranscript('');
    setInterimTranscript('');
  };

  if (!isOpen) return null;

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs">
      <div className="bg-white max-w-2xl w-full rounded-2xl shadow-2xl border border-stone-300 flex flex-col max-h-[92vh] overflow-hidden text-stone-900 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-amber-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-700 text-white flex items-center justify-center shadow-sm">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold font-serif-book text-stone-900 text-lg">
                Grandpa's Oral History & Voice Dictation
              </h3>
              <p className="text-xs text-stone-600">
                Speak family stories aloud to transcribe them directly into <em>"{chapterTitle}"</em>
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (isRecording) stopRecording();
              onClose();
            }}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          
          {/* Big High-Contrast Microphone Controller for Grandpa */}
          <div className="flex flex-col items-center justify-center py-6 px-4 bg-stone-50 rounded-2xl border border-stone-200 text-center">
            {isRecording ? (
              <div className="space-y-4 flex flex-col items-center">
                {/* Pulsating Recording Ring */}
                <div className="relative">
                  <div className="absolute -inset-3 bg-red-500/20 rounded-full animate-ping" />
                  <button
                    onClick={stopRecording}
                    className="relative w-20 h-20 rounded-full bg-red-600 hover:bg-red-700 text-white flex flex-col items-center justify-center shadow-lg transition-transform active:scale-95"
                    title="Stop Voice Recording"
                  >
                    <Square className="w-8 h-8 fill-current" />
                  </button>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-2 text-red-600 font-bold text-sm tracking-wide">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
                    <span>RECORDING LIVE · {formatTimer(recordingSeconds)}</span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1">Speak clearly into your Android device or computer microphone</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 flex flex-col items-center">
                <button
                  onClick={startRecording}
                  className="w-20 h-20 rounded-full bg-amber-800 hover:bg-amber-900 text-white flex flex-col items-center justify-center shadow-lg transition-transform active:scale-95 group"
                  title="Click to Start Speaking"
                >
                  <Mic className="w-9 h-9 group-hover:scale-110 transition-transform" />
                </button>
                <div>
                  <p className="font-bold text-base text-stone-900">Tap to Start Speaking</p>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Your words will automatically turn into text in real time
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Spoken Text Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-stone-800 flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-amber-700" />
                <span>Transcribed Voice Memories</span>
              </label>
              {transcript && (
                <button
                  onClick={() => setTranscript('')}
                  className="text-stone-500 hover:text-stone-800 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Clear Text
                </button>
              )}
            </div>

            <div className="relative">
              <textarea
                value={transcript + (interimTranscript ? ` [${interimTranscript}]` : '')}
                onChange={e => setTranscript(e.target.value)}
                placeholder="Spoken words will appear here as you speak. You can also type or edit grandfather's memories right in this box..."
                rows={5}
                className="w-full p-3.5 border border-stone-300 rounded-xl text-stone-900 text-sm leading-relaxed bg-white focus:ring-2 focus:ring-amber-700 focus:outline-hidden font-serif-book"
              />
              {interimTranscript && (
                <div className="text-[11px] text-amber-700 italic px-1 mt-1">
                  Listening... "{interimTranscript}"
                </div>
              )}
            </div>
          </div>

          {/* Story Prompt Ideas */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Prompt Ideas for Grandfather Ward Scott</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {STORY_PROMPTS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setTranscript(prev => (prev ? prev + '\n\n' : '') + `[Grandfather's Memory: ${p.title}]\n`);
                  }}
                  className="p-2.5 bg-stone-50 hover:bg-amber-50/70 border border-stone-200 hover:border-amber-300 rounded-xl text-left transition-colors"
                >
                  <p className="font-semibold text-xs text-amber-900">{p.title}</p>
                  <p className="text-[11px] text-stone-600 line-clamp-2 mt-0.5">{p.prompt}</p>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
          <button
            onClick={() => {
              if (isRecording) stopRecording();
              onClose();
            }}
            className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-200 rounded-lg"
          >
            Cancel
          </button>

          <button
            onClick={handleApplyToChapter}
            disabled={!transcript.trim()}
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-800 hover:bg-amber-900 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-sm transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Insert Into Current Chapter</span>
          </button>
        </div>

      </div>
    </div>
  );
};
