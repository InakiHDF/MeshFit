'use client';

import { useState, useEffect } from 'react';
import { OutfitCard } from '@/components/OutfitCard';
import { generateOutfits } from '@/app/actions';

export default function OutfitsPage() {
  const [outfits, setOutfits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOutfits = async () => {
      const data = await generateOutfits();
      if (data) {
        setOutfits(data);
      }
      setLoading(false);
    };

    fetchOutfits();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Generated Outfits</h1>
          <p className="text-neutral-400">Combinations based on your connections.</p>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-neutral-500">Generating outfits...</div>
      ) : outfits.length === 0 ? (
        <div className="py-12 text-center text-neutral-500">
          No complete outfits found. Try connecting a Top, Bottom, and Footwear!
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {outfits.map((outfit) => (
            <OutfitCard key={outfit.id} outfit={outfit} />
          ))}
        </div>
      )}
    </div>
  );
}
