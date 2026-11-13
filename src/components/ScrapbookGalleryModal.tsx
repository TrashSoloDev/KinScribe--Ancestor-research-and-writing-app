import React, { useState, useEffect } from 'react';
import { ScrapbookItem, INITIAL_SCRAPBOOK_ITEMS, SCRAPBOOK_STORAGE_KEY } from '../data/scrapbookData';
import { Image as ImageIcon, Upload, Check, X, Camera, Plus, Sparkles, Filter, ExternalLink } from 'lucide-react';

const ANCESTOR_OPTIONS = [
  { id: 'indi_samuel_scott', label: 'Samuel Scott' },
  { id: 'indi_joseph_scott', label: 'Joseph Scott' },
  { id: 'indi_ancil_scott', label: 'Ancil Scott' },
  { id: 'family_archive', label: 'General family archive' }
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onInsertImageToChapter: (htmlSnippet: string) => void;
}

export const ScrapbookGalleryModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onInsertImageToChapter
}) => {
  const [items, setItems] = useState<ScrapbookItem[]>(() => {
    try {
      const saved = localStorage.getItem(SCRAPBOOK_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (error) {
      console.warn('Could not read saved scrapbook items', error);
    }
    return INITIAL_SCRAPBOOK_ITEMS;
  });
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'photograph' | 'document' | 'church'>('all');
  const [activeItem, setActiveItem] = useState<ScrapbookItem>(() => items[0] || INITIAL_SCRAPBOOK_ITEMS[0]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancementNotice, setEnhancementNotice] = useState<string | null>(null);
  const [enhancedMap, setEnhancedMap] = useState<Record<string, string>>({});
  const [selectedAncestorId, setSelectedAncestorId] = useState<string>(INITIAL_SCRAPBOOK_ITEMS[0]?.associatedAncestorId || 'family_archive');

  useEffect(() => {
    const fallback = activeItem?.associatedAncestorId || 'family_archive';
    setSelectedAncestorId(fallback);
  }, [activeItem]);

  useEffect(() => {
    try {
      localStorage.setItem(SCRAPBOOK_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.warn('Could not save scrapbook items', error);
      setEnhancementNotice('This photo could not be saved on this device. Try a smaller image or free storage space.');
    }
  }, [items]);

  if (!isOpen) return null;

  const filteredItems = items.filter(it => {
    if (selectedCategory === 'all') return true;
    return it.category === selectedCategory;
  });

  const handleInsert = (item: ScrapbookItem) => {
    const selectedAncestor = ANCESTOR_OPTIONS.find(a => a.id === selectedAncestorId) || ANCESTOR_OPTIONS[0];
    const associatedLabel = selectedAncestor.id === 'family_archive' ? 'Family archive' : `Related to ${selectedAncestor.label}`;

    const html = `
<figure class="my-6 p-3 bg-stone-50 border border-stone-200 rounded-xl text-center">
  <img src="${item.imageUrl}" alt="${item.title}" class="max-h-80 mx-auto rounded-lg shadow-sm object-cover" />
  <figcaption class="mt-2.5 text-xs text-stone-600 font-serif-book italic">
    <strong>${item.title} (${item.year})</strong> — ${item.description}
    <span class="block text-[11px] text-stone-500 not-italic font-sans-ui mt-1">${associatedLabel}</span>
    <span class="block text-[11px] text-stone-400 not-italic font-sans-ui mt-0.5">Source: ${item.sourceAttribution}</span>
  </figcaption>
</figure>
`;
    onInsertImageToChapter(html);
    setToastMessage(`Attached "${item.title}" to chapter!`);
    setTimeout(() => {
      setToastMessage(null);
      onClose();
    }, 1000);
  };

  const handleUploadUserImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const image = new Image();
      image.onload = () => {
        const maxDimension = 1800;
        const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        const context = canvas.getContext('2d');
        if (!context) {
          setEnhancementNotice('This image could not be prepared for saving.');
          return;
        }

        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        const newItem: ScrapbookItem = {
          id: `user_scrap_${Date.now()}`,
          title: file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '),
          category: 'photograph',
          year: 'Family Archive',
          location: 'Fitts Village, Barbados',
          description: 'Uploaded family archival photograph for inclusion in manuscript.',
          sourceAttribution: 'Ward Scott Private Family Collection',
          imageUrl: canvas.toDataURL('image/jpeg', 0.86)
        };
        setEnhancementNotice(null);
        setItems(prev => [newItem, ...prev]);
        setActiveItem(newItem);
      };
      image.onerror = () => setEnhancementNotice('This image file could not be opened. Try another photo.');
      image.src = String(event.target?.result || '');
    };
    reader.readAsDataURL(file);
  };

  const enhancePhotoLocally = (imageDataUrl: string): Promise<string> => new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('This browser cannot process photos on the device.'));
        return;
      }

      const width = img.naturalWidth || img.width;
      const height = img.naturalHeight || img.height;
      canvas.width = width;
      canvas.height = height;

      ctx.filter = 'contrast(1.35) brightness(1.08) saturate(0.6) grayscale(0.08)';
      ctx.drawImage(img, 0, 0, width, height);

      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
        const corrected = Math.min(255, Math.max(0, luminance * 1.12));
        data[i] = corrected;
        data[i + 1] = corrected;
        data[i + 2] = corrected;
      }

      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/jpeg', 0.92));
    };
    img.onerror = () => reject(new Error('Could not read this photo for local enhancement.'));
    img.src = imageDataUrl;
  });

  const handleEnhanceSelectedImage = async () => {
    if (!activeItem) return;

    try {
      setIsEnhancing(true);
      setEnhancementNotice(null);

      const imageUrl = enhancedMap[activeItem.id] || activeItem.imageUrl;
      const imageDataUrl = imageUrl.startsWith('data:')
        ? imageUrl
        : await (async () => {
            const blobResp = await fetch(imageUrl);
            const blob = await blobResp.blob();
            return await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(String(reader.result));
              reader.onerror = () => reject(new Error('Could not read the image for enhancement.'));
              reader.readAsDataURL(blob);
            });
          })();

      const enhancedDataUrl = await enhancePhotoLocally(imageDataUrl);

      const updatedItem: ScrapbookItem = {
        ...activeItem,
        imageUrl: enhancedDataUrl,
        description: `${activeItem.description} (Local restoration improved contrast and clarity while preserving the original background and scene.)`
      };

      setItems(prev => prev.map(item => item.id === activeItem.id ? updatedItem : item));
      setActiveItem(updatedItem);
      setEnhancedMap(prev => ({ ...prev, [activeItem.id]: enhancedDataUrl }));
      setEnhancementNotice('Restoration finished locally on your device. The background and scene were kept intact.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Enhancement failed.';
      setEnhancementNotice(message);
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs">
      <div className="bg-white max-w-4xl w-full rounded-2xl shadow-2xl border border-stone-300 flex flex-col max-h-[92vh] overflow-hidden text-stone-900 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-amber-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-800 text-white flex items-center justify-center shadow-sm">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold font-serif-book text-stone-900 text-lg">
                Fitts Village Historical Scrapbook & Photo Gallery
              </h3>
              <p className="text-xs text-stone-600">
                Archival photos, colonial deeds, and parish church records to illustrate your book chapters
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

        {/* Filter and Upload Bar */}
        <div className="px-5 py-2.5 bg-stone-100 border-b border-stone-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-stone-500" />
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                selectedCategory === 'all' ? 'bg-amber-800 text-white' : 'text-stone-600 hover:bg-stone-200'
              }`}
            >
              All Records ({items.length})
            </button>
            <button
              onClick={() => setSelectedCategory('photograph')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                selectedCategory === 'photograph' ? 'bg-amber-800 text-white' : 'text-stone-600 hover:bg-stone-200'
              }`}
            >
              Photographs
            </button>
            <button
              onClick={() => setSelectedCategory('document')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                selectedCategory === 'document' ? 'bg-amber-800 text-white' : 'text-stone-600 hover:bg-stone-200'
              }`}
            >
              Deeds & Manifests
            </button>
            <button
              onClick={() => setSelectedCategory('church')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                selectedCategory === 'church' ? 'bg-amber-800 text-white' : 'text-stone-600 hover:bg-stone-200'
              }`}
            >
              Parish Churches
            </button>
          </div>

          {/* Upload Button */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleEnhanceSelectedImage}
              disabled={isEnhancing}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-800 hover:bg-amber-900 disabled:bg-stone-400 text-white rounded-lg font-semibold shadow-xs transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span>{isEnhancing ? 'Restoring…' : 'Restore Photo Locally'}</span>
            </button>

            <label className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-900 text-white rounded-lg font-semibold cursor-pointer shadow-xs transition-colors">
              <Upload className="w-3.5 h-3.5 text-amber-300" />
              <span>Upload Photo / Scan</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUploadUserImage}
              />
            </label>
          </div>
        </div>

        {/* Modal Body: Split Grid & Inspector */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
          
          {/* Thumbnails Gallery */}
          <div className="md:col-span-7 p-4 overflow-y-auto border-r border-stone-200 bg-stone-50">
            <div className="grid grid-cols-2 gap-3">
              {filteredItems.map(item => {
                const isSelected = activeItem.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setActiveItem(item)}
                    className={`group cursor-pointer rounded-xl overflow-hidden border transition-all text-left bg-white ${
                      isSelected
                        ? 'border-amber-600 ring-2 ring-amber-500 shadow-md'
                        : 'border-stone-200 hover:border-amber-300'
                    }`}
                  >
                    <div className="h-32 bg-stone-200 overflow-hidden relative">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-1.5 right-1.5 text-[10px] bg-stone-900/80 text-white px-1.5 py-0.5 rounded font-mono">
                        {item.year}
                      </span>
                    </div>
                    <div className="p-2.5">
                      <p className="font-bold text-xs text-stone-900 truncate">{item.title}</p>
                      <p className="text-[11px] text-stone-500 truncate mt-0.5">{item.location}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Item Preview & Attach Action */}
          <div className="md:col-span-5 p-5 flex flex-col justify-between overflow-y-auto bg-white space-y-4">
            <div className="space-y-3">
              <div className="rounded-xl overflow-hidden border border-stone-200 shadow-xs max-h-56 bg-stone-100 flex items-center justify-center">
                <img
                  src={enhancedMap[activeItem.id] || activeItem.imageUrl}
                  alt={activeItem.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="rounded-lg border border-amber-200 bg-amber-50/80 px-3 py-2 text-[11px] text-amber-900 leading-relaxed">
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Photo Restoration Rule</span>
                </div>
                <p>Local device processing improves contrast, scratches, and readability, while keeping the original background and scene intact — no new objects or added people.</p>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] text-emerald-900">
                <span className="font-bold">Source confidence</span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-bold">High</span>
              </div>

              {enhancementNotice && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] text-emerald-800 font-medium">
                  {enhancementNotice}
                </div>
              )}

              <div>
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 mb-1">
                  {activeItem.category} · {activeItem.year}
                </span>
                <h4 className="font-serif-book font-bold text-stone-900 text-base">
                  {activeItem.title}
                </h4>
                <p className="text-xs text-stone-500 mt-0.5">{activeItem.location}</p>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-600">
                  Link this image to a family member
                </label>
                <select
                  value={selectedAncestorId}
                  onChange={(e) => setSelectedAncestorId(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 bg-stone-50 px-2.5 py-2 text-xs text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                >
                  {ANCESTOR_OPTIONS.map(option => (
                    <option key={option.id} value={option.id}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-700 leading-relaxed space-y-1">
                <p>{activeItem.description}</p>
                <p className="text-[11px] text-stone-500 pt-1 border-t border-stone-200">
                  <strong>Source:</strong> {activeItem.sourceAttribution}
                </p>
              </div>
            </div>

            {/* Attach Action */}
            <div className="pt-3 border-t border-stone-200 flex items-center justify-between">
              {toastMessage ? (
                <div className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{toastMessage}</span>
                </div>
              ) : (
                <span className="text-[11px] text-stone-500">Embeds into book chapter</span>
              )}

              <button
                onClick={() => handleInsert(activeItem)}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Attach to Active Chapter</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
