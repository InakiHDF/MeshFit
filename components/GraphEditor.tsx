'use client';

import { useCallback, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';

// Custom Node Component to show Image
const ItemNode = ({ data }: { data: { label: string; image?: string; category: string } }) => {
  return (
    <div className="relative flex h-24 w-24 flex-col items-center justify-center overflow-hidden rounded-full border-2 border-white/20 bg-black/80 shadow-xl transition-transform hover:scale-110 hover:border-blue-500">
      <Handle type="target" position={Position.Top} className="!bg-blue-500" />
      {data.image ? (
        <img src={data.image} alt={data.label} className="h-full w-full object-cover opacity-80" />
      ) : (
        <div className="text-xs text-center p-2">{data.label}</div>
      )}
      <div className="absolute bottom-0 w-full bg-black/60 py-1 text-center text-[10px] font-bold text-white backdrop-blur-sm">
        {data.label}
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-blue-500" />
    </div>
  );
};

const nodeTypes = {
  item: ItemNode,
};

const INITIAL_NODES: Node[] = [
  {
    id: '1',
    type: 'item',
    position: { x: 250, y: 50 },
    data: { label: 'Leather Jacket', category: 'Outerwear', image: 'https://images.unsplash.com/photo-1551028919-38f42243f859?auto=format&fit=crop&q=80&w=600' },
  },
  {
    id: '2',
    type: 'item',
    position: { x: 100, y: 250 },
    data: { label: 'White Tee', category: 'Top', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=600' },
  },
  {
    id: '3',
    type: 'item',
    position: { x: 400, y: 250 },
    data: { label: 'Blue Jeans', category: 'Bottom', image: 'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?auto=format&fit=crop&q=80&w=600' },
  },
];

const INITIAL_EDGES: Edge[] = [];

export function GraphEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#3b82f6', strokeWidth: 2 } }, eds)),
    [setEdges],
  );

  return (
    <div className="h-[calc(100vh-120px)] w-full rounded-xl border border-white/10 bg-neutral-900/30 backdrop-blur-sm">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        className="bg-transparent"
      >
        <Background color="#444" gap={16} />
        <Controls className="bg-neutral-800 border-white/10 fill-white text-white" />
        <MiniMap
          nodeColor={() => '#3b82f6'}
          maskColor="rgba(0, 0, 0, 0.6)"
          className="bg-neutral-900 border border-white/10"
        />
      </ReactFlow>
    </div>
  );
}
