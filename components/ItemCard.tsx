import { clsx } from 'clsx';

interface ItemProps {
  id: string;
  name: string;
  image_url?: string;
  category: string;
  attributes: {
    color: string;
    material: string;
    fit?: string;
    formality: number;
    warmth: number;
  };
}

export function ItemCard({ item }: { item: ItemProps }) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/5 bg-neutral-900/50 transition-all hover:border-white/20 hover:shadow-lg hover:shadow-blue-500/10">
      <div className="aspect-square w-full overflow-hidden bg-black/40">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-neutral-700">
            No Image
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="mb-1 text-xs font-medium uppercase tracking-wider text-blue-400">
          {item.category}
        </div>
        <h3 className="font-semibold text-white">{item.name}</h3>

        <div className="mt-3 flex flex-wrap gap-2 text-xs text-neutral-400">
          <span className="rounded-full bg-white/5 px-2 py-1">{item.attributes.color}</span>
          <span className="rounded-full bg-white/5 px-2 py-1">{item.attributes.material}</span>
        </div>
      </div>
    </div>
  );
}
