'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { AddItemForm } from '@/components/AddItemForm';
import { ItemCard } from '@/components/ItemCard';

// Mock Data
const MOCK_ITEMS = [
  {
    id: '1',
    name: 'Black Leather Jacket',
    category: 'Outerwear',
    image_url: 'https://images.unsplash.com/photo-1551028919-38f42243f859?auto=format&fit=crop&q=80&w=600',
    attributes: { color: 'Black', material: 'Leather', formality: 60, warmth: 80 }
  },
  {
    id: '2',
    name: 'White T-Shirt',
    category: 'Top',
    image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=600',
    attributes: { color: 'White', material: 'Cotton', fit: 'Regular', formality: 10, warmth: 20 }
  },
  {
    id: '3',
    name: 'Blue Jeans',
    category: 'Bottom',
    image_url: 'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?auto=format&fit=crop&q=80&w=600',
    attributes: { color: 'Blue', material: 'Denim', fit: 'Slim', formality: 30, warmth: 40 }
  }
];

export default function WardrobePage() {
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Wardrobe</h1>
          <p className="text-neutral-400">Manage your collection and add new pieces.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition-transform hover:scale-105 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          {showAddForm ? 'Close' : 'Add Item'}
        </button>
      </header>

      {showAddForm && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-300">
          <AddItemForm />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {MOCK_ITEMS.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
