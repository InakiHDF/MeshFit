"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import ForceGraph2D, {
  type LinkObject,
  type NodeObject,
  type ForceGraphMethods,
} from "react-force-graph-2d";

import type { Strength } from "@/lib/types";

export type GraphNode = {
  id: string;
  name: string;
  category: string;
  formality: number;
  x?: number;
  y?: number;
};

export type GraphLink = {
  id: string;
  source: string | GraphNode;
  target: string | GraphNode;
  strength: Strength;
};

const categoryColor: Record<string, string> = {
  top: "#60a5fa",
  bottom: "#fb923c",
  shoes: "#fcd34d",
  outerwear: "#a78bfa",
  accessory: "#34d399",
};

const strengthColor: Record<Strength, string> = {
  strong: "#38bdf8",
  ok: "#a5b4fc",
  weak: "#f97316",
};

type Props = {
  nodes: GraphNode[];
  links: GraphLink[];
  selectedIds?: string[];
  onNodeSelect?: (id: string) => void;
};

export function GraphCanvas({ nodes, links, selectedIds = [], onNodeSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<ForceGraphMethods>();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // 1. Robust Resize Observer
  useEffect(() => {
    if (!containerRef.current) return;

    const updateSize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    // Initial size
    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  // 2. Stable Click Handler
  const handleNodeClick = useCallback(
    (node: NodeObject) => {
      if (onNodeSelect && node.id) {
        onNodeSelect(node.id as string);
      }
    },
    [onNodeSelect],
  );

  // 3. Node Painting
  const paintNode = useCallback(
    (node: NodeObject, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const typed = node as GraphNode;
      const label = typed.name;
      const color = categoryColor[typed.category] ?? "#94a3b8";
      const isSelected = selectedIds.includes(typed.id);
      const baseRadius = 8;
      const radius = isSelected ? 12 : baseRadius;

      // Draw Circle
      ctx.beginPath();
      ctx.arc(node.x ?? 0, node.y ?? 0, radius, 0, 2 * Math.PI, false);
      ctx.fillStyle = color;
      ctx.fill();

      // Selection Ring
      if (isSelected) {
        ctx.lineWidth = 2 / globalScale; // Keep stroke thin regardless of zoom
        ctx.strokeStyle = "#38bdf8"; // Cyan
        ctx.stroke();
        
        // Glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#38bdf8";
      } else {
        ctx.shadowBlur = 0;
      }

      // Text Label
      const fontSize = 12 / globalScale;
      ctx.font = `500 ${fontSize}px Inter, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillStyle = isSelected ? "#ffffff" : "rgba(255, 255, 255, 0.7)";
      ctx.fillText(label, node.x ?? 0, (node.y ?? 0) + radius + 2);
      
      // Reset shadow for other elements
      ctx.shadowBlur = 0;
    },
    [selectedIds],
  );

  // 4. Hit Area (Default is usually fine, removing custom to minimize error surface)
  // Reverting to default interaction settings to debug "only one node works" issue.
  
  const [lastClicked, setLastClicked] = useState<string>("None");

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full min-h-[500px] bg-[#09090b] relative overflow-hidden"
    >
      {/* Debug Overlay */}
      <div className="absolute top-2 left-2 z-50 pointer-events-none bg-black/80 text-white text-xs p-2 rounded">
        <p>Debug Info:</p>
        <p>Canvas: {Math.round(dimensions.width)}x{Math.round(dimensions.height)}</p>
        <p>Last Click: {lastClicked}</p>
        <p>Nodes: {nodes.length}</p>
      </div>

      {dimensions.width > 0 && (
        <ForceGraph2D
          ref={graphRef}
          width={dimensions.width}
          height={dimensions.height}
          graphData={{ nodes, links }}
          
          // Interaction
          onNodeClick={(node) => {
             setLastClicked(node.id as string);
             handleNodeClick(node);
          }}
          // Re-enabling drag to see if it helps with event capture
          enableNodeDrag={true}
          
          // Rendering
          nodeCanvasObject={paintNode}
          // nodePointerAreaPaint removed to use default hit detection
          
          // Links
          linkColor={(link) => strengthColor[(link as GraphLink).strength] ?? "#52525b"}
          linkWidth={(link) => {
             const s = (link as GraphLink).strength;
             return s === "strong" ? 3 : s === "ok" ? 2 : 1;
          }}
          
          // Physics
          cooldownTicks={100}
          d3AlphaDecay={0.02}
          d3VelocityDecay={0.3}
          
          // Global
          backgroundColor="#09090b"
        />
      )}
    </div>
  );
}
