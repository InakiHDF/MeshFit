import { GraphEditor } from '@/components/GraphEditor';

export default function NodesPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-white">Connections Map</h1>
        <p className="text-sm text-neutral-400">Drag to connect items that look good together.</p>
      </div>
      <GraphEditor />
    </div>
  );
}
