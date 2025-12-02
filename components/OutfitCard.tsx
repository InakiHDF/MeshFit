interface OutfitProps {
  id: string;
  items: {
    id: string;
    name: string;
    image_url?: string;
    category: string;
  }[];
}

export function OutfitCard({ outfit }: { outfit: OutfitProps }) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/5 bg-neutral-900/50 p-4 transition-all hover:border-white/20 hover:shadow-lg hover:shadow-purple-500/10">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-white">Outfit #{outfit.id}</h3>
        <span className="rounded-full bg-purple-500/10 px-2 py-1 text-xs text-purple-400">
          {outfit.items.length} items
        </span>
      </div>

      <div className="flex -space-x-4 overflow-hidden py-2">
        {outfit.items.map((item, i) => (
          <div
            key={item.id}
            className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-full border-2 border-neutral-900 bg-neutral-800 transition-transform hover:scale-110 hover:z-10"
            style={{ zIndex: i }}
          >
            {item.image_url ? (
              <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[10px] text-neutral-500">
                {item.name}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {outfit.items.map(item => (
          <span key={item.id} className="text-xs text-neutral-400 bg-white/5 px-2 py-1 rounded-md">
            {item.name}
          </span>
        ))}
      </div>
    </div>
  );
}
