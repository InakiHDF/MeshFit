'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { AddItemForm } from '@/components/AddItemForm';
import { ItemCard } from '@/components/ItemCard';
import { getGraphData } from '@/app/actions';

export default function WardrobePage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [items, setItems] = useState<any[]>([]);

  const fetchItems = async () => {
    const { items } = await getGraphData();
    if (items) {
      // Transform for display if needed, but our schema matches mostly
      setItems(items.map(i => ({
        ...i,
        category: i.categories?.type || 'Unknown', // Map joined category
        attributes: i.attributes || {}
      })));
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

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
          <AddItemForm onSuccess={() => {
            setShowAddForm(false);
            fetchItems();
          }} />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {items.length === 0 ? (
          <div className="col-span-full py-12 text-center text-neutral-500">
            No items yet. Add some to get started!
          </div>
        ) : (
          items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))
        )}
      </div>
    </div>
  );
}
