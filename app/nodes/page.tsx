'use client';

import { useState, useEffect } from 'react';
import { GraphEditor } from '@/components/GraphEditor';
import { getGraphData } from '@/app/actions';
import { Node, Edge, MarkerType } from 'reactflow';

export default function NodesPage() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { items, connections } = await getGraphData();

      if (items && connections) {
        // Map Items to Nodes with random positions (or circular layout)
        const newNodes: Node[] = items.map((item, index) => {
          const angle = (index / items.length) * 2 * Math.PI;
          const radius = 300; // Layout radius
          const x = 400 + radius * Math.cos(angle);
          const y = 300 + radius * Math.sin(angle);

          return {
            id: item.id,
            type: 'item',
            position: { x, y },
            data: {
              label: item.name,
              category: item.categories?.type,
              image: item.image_url
            },
          };
        });

        // Map Connections to Edges
        const newEdges: Edge[] = connections.map((conn) => ({
          id: `e${conn.item_id_a}-${conn.item_id_b}`,
          source: conn.item_id_a,
          target: conn.item_id_b,
          animated: true,
          style: { stroke: '#3b82f6', strokeWidth: 3 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#3b82f6',
          },
        }));

        setNodes(newNodes);
        setEdges(newEdges);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-white">Loading Graph...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-white">Connections Map</h1>
        <p className="text-sm text-neutral-400">Click nodes to connect them.</p>
      </div>
      <GraphEditor initialNodes={nodes} initialEdges={edges} />
    </div>
  );
}
