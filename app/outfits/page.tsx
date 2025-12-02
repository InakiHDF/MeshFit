'use client';

import { OutfitCard } from '@/components/OutfitCard';

// Mock Outfits generated from the graph
const MOCK_OUTFITS = [
  {
    id: '1',
    items: [
      { id: '1', name: 'Leather Jacket', category: 'Outerwear', image_url: 'https://images.unsplash.com/photo-1551028919-38f42243f859?auto=format&fit=crop&q=80&w=600' },
      { id: '2', name: 'White Tee', category: 'Top', image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=600' },
      { id: '3', name: 'Blue Jeans', category: 'Bottom', image_url: 'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?auto=format&fit=crop&q=80&w=600' },
    ]
  },
  {
    id: '2',
    items: [
      { id: '2', name: 'White Tee', category: 'Top', image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=600' },
      { id: '3', name: 'Blue Jeans', category: 'Bottom', image_url: 'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?auto=format&fit=crop&q=80&w=600' },
    ]
  }
];

export default function OutfitsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Generated Outfits</h1>
          <p className="text-neutral-400">Combinations based on your connections.</p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {MOCK_OUTFITS.map((outfit) => (
          <OutfitCard key={outfit.id} outfit={outfit} />
        ))}
      </div>
    </div>
  );
}
