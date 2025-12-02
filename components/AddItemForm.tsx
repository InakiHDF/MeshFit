'use client';

import { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { clsx } from 'clsx';

const CATEGORIES = [
  { id: 'top', label: 'Top' },
  { id: 'bottom', label: 'Bottom' },
  { id: 'footwear', label: 'Footwear' },
  { id: 'outerwear', label: 'Outerwear' },
  { id: 'accessory', label: 'Accessory' },
];

const COLORS = ['Black', 'White', 'Grey', 'Navy', 'Beige', 'Brown', 'Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Pink', 'Orange', 'Multi'];
const MATERIALS = ['Cotton', 'Wool', 'Denim', 'Leather', 'Polyester', 'Linen', 'Silk', 'Synthetic', 'Canvas', 'Suede'];
const FITS = ['Slim', 'Regular', 'Oversized', 'Skinny', 'Loose', 'Tapered', 'Boxy'];

export function AddItemForm() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'top',
    color: 'Black',
    material: 'Cotton',
    fit: 'Regular',
    formality: 50,
    warmth: 50,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: Implement Supabase submission
    console.log('Submitting:', { ...formData, image: imagePreview });

    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    alert('Item added! (Simulation)');
    setLoading(false);
    // Reset form
    setFormData({
      name: '',
      category: 'top',
      color: 'Black',
      material: 'Cotton',
      fit: 'Regular',
      formality: 50,
      warmth: 50,
    });
    setImagePreview(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-white/10 bg-neutral-900/50 p-6 backdrop-blur-md">
      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-300">Item Name</label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full rounded-lg border border-white/10 bg-black/50 px-4 py-2 text-white placeholder-neutral-500 focus:border-blue-500 focus:outline-none"
          placeholder="e.g. Black T-Shirt"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-300">Category</label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setFormData({ ...formData, category: cat.id })}
              className={clsx(
                'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                formData.category === cat.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/5 text-neutral-400 hover:bg-white/10'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Image Upload */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-neutral-300">Photo</label>
        <div className="relative flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-white/10 bg-black/20 hover:border-white/20 hover:bg-black/30 transition-colors">
          {imagePreview ? (
            <>
              <img src={imagePreview} alt="Preview" className="h-full w-full object-contain p-2" />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setImagePreview(null);
                }}
                className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white hover:bg-red-500/80"
              >
                <X className="h-4 w-4" />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 text-neutral-500">
              <Upload className="h-8 w-8" />
              <span className="text-sm">Click to upload image</span>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            className="absolute inset-0 cursor-pointer opacity-0"
            onChange={handleImageChange}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-300">Color</label>
          <select
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-black/50 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
          >
            {COLORS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-300">Material</label>
          <select
            value={formData.material}
            onChange={(e) => setFormData({ ...formData, material: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-black/50 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
          >
            {MATERIALS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        {formData.category !== 'footwear' && formData.category !== 'accessory' && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-300">Fit</label>
            <select
              value={formData.fit}
              onChange={(e) => setFormData({ ...formData, fit: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-black/50 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
            >
              {FITS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <label className="font-medium text-neutral-300">Formality</label>
            <span className="text-neutral-500">{formData.formality}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={formData.formality}
            onChange={(e) => setFormData({ ...formData, formality: Number(e.target.value) })}
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-blue-500"
          />
          <div className="flex justify-between text-xs text-neutral-600">
            <span>Casual</span>
            <span>Formal</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <label className="font-medium text-neutral-300">Warmth</label>
            <span className="text-neutral-500">{formData.warmth}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={formData.warmth}
            onChange={(e) => setFormData({ ...formData, warmth: Number(e.target.value) })}
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-red-500"
          />
          <div className="flex justify-between text-xs text-neutral-600">
            <span>Light</span>
            <span>Heavy</span>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
      >
        {loading ? 'Adding...' : 'Add to Wardrobe'}
      </button>
    </form>
  );
}
