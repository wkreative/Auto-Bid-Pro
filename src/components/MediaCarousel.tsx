'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Play, X } from 'lucide-react';

type MediaItem = {
  type: 'image' | 'video';
  url: string;
  is_primary?: boolean;
};

export default function MediaCarousel({ items }: { items: MediaItem[] }) {
  const [current, setCurrent] = useState(0);
  const [lightbox, setLightbox] = useState<{ open: boolean; index: number }>({ open: false, index: 0 });

  if (items.length === 0) {
    return (
      <div className="h-[400px] md:h-[500px] w-full rounded-2xl overflow-hidden bg-white/5 flex items-center justify-center">
        <p className="text-gray-500">Sin imágenes disponibles</p>
      </div>
    );
  }

  const prev = () => setCurrent((c) => (c === 0 ? items.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === items.length - 1 ? 0 : c + 1));

  const openLightbox = (idx: number) => setLightbox({ open: true, index: idx });

  return (
    <>
      <div className="relative h-[400px] md:h-[500px] w-full rounded-2xl overflow-hidden group">
        {items[current].type === 'video' ? (
          <video
            src={items[current].url}
            controls
            className="w-full h-full object-contain bg-black"
          />
        ) : (
          <img
            src={items[current].url}
            alt=""
            className="w-full h-full object-contain bg-black cursor-pointer"
            onClick={() => openLightbox(current)}
          />
        )}

        {items.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {items.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrent(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    idx === current ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {items.length > 1 && (
        <div className="flex gap-2 mt-2 overflow-x-auto p-2">
          {items.map((item, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`h-20 w-28 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-colors ${
                idx === current ? 'border-primary' : 'border-transparent hover:border-white/30'
              }`}
            >
              {item.type === 'video' ? (
                <div className="relative w-full h-full">
                  <video src={item.url} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <Play className="h-6 w-6 text-white" />
                  </div>
                </div>
              ) : (
                <img src={item.url} className="w-full h-full object-cover" />
              )}
            </button>
          ))}
        </div>
      )}

      {lightbox.open && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center cursor-pointer"
          onClick={() => setLightbox({ open: false, index: 0 })}
        >
          <button className="absolute top-4 right-4 p-2 text-white hover:text-gray-300 z-10">
            <X className="h-8 w-8" />
          </button>

          {items[lightbox.index].type === 'video' ? (
            <video
              src={items[lightbox.index].url}
              controls
              className="max-w-[90vw] max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <img
              src={items[lightbox.index].url}
              alt=""
              className="max-w-[90vw] max-h-[90vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          )}

          {items.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightbox((l) => ({ ...l, index: l.index === 0 ? items.length - 1 : l.index - 1 }));
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightbox((l) => ({ ...l, index: l.index === items.length - 1 ? 0 : l.index + 1 }));
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
