// Shows the images found on the scraped page along with their alt text.

'use client';

import { useState } from 'react';
import ResultCard from './ResultCard';

export default function ImagesList({ images }) {
  // plenty of sites block hotlinking, so remember which ones failed to load
  const [brokenImages, setBrokenImages] = useState([]);

  const markBroken = (index) => {
    setBrokenImages((previous) => [...previous, index]);
  };

  return (
    <ResultCard title="Images" badge={`${images.length} found`}>
      {images.length === 0 ? (
        <p className="text-sm text-gray-500">No images found on this page.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((image, i) => (
            <figure
              key={i}
              className="overflow-hidden rounded-lg border border-gray-800 bg-gray-800"
            >
              {brokenImages.includes(i) ? (
                <div className="flex h-28 items-center justify-center text-xs text-gray-600">
                  Preview unavailable
                </div>
              ) : (
                // plain <img> on purpose — next/image needs every external
                // domain listed in the config, and we can't know them ahead of time
                <img
                  src={image.src}
                  alt={image.alt || 'Scraped image'}
                  loading="lazy"
                  onError={() => markBroken(i)}
                  className="h-28 w-full bg-gray-900 object-cover"
                />
              )}

              <figcaption className="px-2 py-1.5">
                <p className="truncate text-xs text-gray-400">
                  {image.alt || <span className="text-amber-500">No alt text</span>}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </ResultCard>
  );
}
