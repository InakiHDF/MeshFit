'use client';

import { useCallback, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Edge,
  Node,
  Handle,
  Position,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { clsx } from 'clsx';

// Custom Node Component
const ItemNode = ({ data, selected }: { data: { label: string; image?: string; category: string }, selected: boolean }) => {
  return (
    <div
      className={clsx(
        "relative flex h-24 w-24 flex-col items-center justify-center overflow-hidden rounded-full border-4 bg-black/80 shadow-xl transition-all",
        selected ? "border-blue-500 scale-110 shadow-blue-500/50" : "border-white/20 hover:scale-105 hover:border-white/40"
      )}
    >
      {/* Handles are needed for ReactFlow edges to work, but we hide them or make them non-interactive for dragging if we want pure click-to-connect. 
          For now, we keep them but rely on programmatic edge creation. */}
      <Handle type="target" position={Position.Top} className="opacity-0" />

      {data.image ? (
        <img src={data.image} alt={data.label} className="h-full w-full object-cover opacity-90" />
      ) : (
        <div className="text-xs text-center p-2">{data.label}</div>
      )}

      <div className="absolute bottom-0 w-full bg-black/60 py-1 text-center text-[10px] font-bold text-white backdrop-blur-sm">
        {data.label}
      </div>

      <Handle type="source" position={Position.Bottom} className="opacity-0" />
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
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (!selectedNodeId) {
        // Select the first node
        setSelectedNodeId(node.id);
        setNodes((nds) =>
          nds.map((n) => ({
            ...n,
            selected: n.id === node.id, // ReactFlow handles 'selected' prop visually if we use it, but we are passing it to custom node too
          }))
        );
      } else if (selectedNodeId === node.id) {
        // Deselect if clicking the same node
        setSelectedNodeId(null);
        setNodes((nds) => nds.map((n) => ({ ...n, selected: false })));
      } else {
        // Create connection
        const newEdge: Edge = {
          id: `e${selectedNodeId}-${node.id}`,
          source: selectedNodeId,
          target: node.id,
          animated: true,
          style: { stroke: '#3b82f6', strokeWidth: 3 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#3b82f6',
          },
        };

        setEdges((eds) => addEdge(newEdge, eds));

        // Reset selection
        setSelectedNodeId(null);
        setNodes((nds) => nds.map((n) => ({ ...n, selected: false })));
      }
    },
    [selectedNodeId, setNodes, setEdges]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
    setNodes((nds) => nds.map((n) => ({ ...n, selected: false })));
  }, [setNodes]);

  return (
    <div className="h-[calc(100vh-120px)] w-full rounded-xl border border-white/10 bg-neutral-900/30 backdrop-blur-sm">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        className="bg-transparent"
        // Disable default selection behavior to handle it manually for connection logic
        elementsSelectable={false}
        nodesConnectable={false} // Disable drag-to-connect
      >
        <Background color="#444" gap={16} />
        <Controls className="bg-neutral-800 border-white/10 fill-white text-white" />
        <MiniMap
          nodeColor={() => '#3b82f6'}
          maskColor="rgba(0, 0, 0, 0.6)"
          className="bg-neutral-900 border border-white/10"
        />
      </ReactFlow>

      {/* Instruction Overlay */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-4 py-2 text-sm text-white backdrop-blur-md border border-white/10 pointer-events-none">
        {selectedNodeId ? "Select another node to connect" : "Click a node to start connecting"}
      </div>
    </div>
  );
}
