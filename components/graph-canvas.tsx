"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import ForceGraph2D, {
  type LinkObject,
  type NodeObject,
} from "react-force-graph-2d";

import type { Strength } from "@/lib/types";

export type GraphNode = {
  id: string;
  name: string;
  category: string;
  formality: number;
};

export type GraphLink = {
  id: string;
  source: string;
  target: string;
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
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  const data = useMemo(
    () => ({
      nodes,
      links: links.map((l) => ({
        ...l,
        source: l.source,
        target: l.target,
      })),
    }),
    [nodes, links],
  );

  return (
    <div ref={containerRef} className="h-full w-full min-h-[400px] bg-[#0f1118] relative overflow-hidden">
      {isMounted && dimensions.width > 0 && (
        <ForceGraph2D
          width={dimensions.width}
          height={dimensions.height}
          graphData={data}
          nodeLabel={(node) => (node as GraphNode).name}
          nodeCanvasObject={(node: NodeObject, ctx, globalScale) => {
            const typed = node as GraphNode;
            const label = typed.name;
            const color = categoryColor[typed.category] ?? "#94a3b8";
            const isSelected = selectedIds.includes(typed.id);
            const radius = isSelected ? 12 : 8;

            ctx.beginPath();
            ctx.arc(node.x ?? 0, node.y ?? 0, radius, 0, 2 * Math.PI, false);
            ctx.fillStyle = color;
            ctx.fill();
            
            if (isSelected) {
              ctx.strokeStyle = "#38bdf8";
              ctx.lineWidth = 3;
              ctx.stroke();
            }

            const fontSize = 12 / globalScale;
            ctx.font = `${fontSize}px Inter, system-ui`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "#e2e8f0";
            ctx.fillText(label, (node.x ?? 0), (node.y ?? 0) + radius + 8);
          }}
          onNodeClick={(node) => onNodeSelect?.((node as GraphNode).id)}
          enableNodeDrag={false}
          onNodeHover={(node) => {
             // Force cursor update directly on the canvas element if possible, 
             // or fall back to body. Using the container ref would be cleaner but body works globally.
             if (containerRef.current) {
                containerRef.current.style.cursor = node ? "pointer" : "default";
             }
          }}
          // Increased hit area again, ensuring it matches coordinate system
          nodePointerAreaPaint={(node: NodeObject, color: string, ctx) => {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(node.x ?? 0, node.y ?? 0, 20, 0, 2 * Math.PI, false);
            ctx.fill();
          }}
          linkColor={(link: LinkObject) =>
            strengthColor[(link as GraphLink).strength] ?? "#475569"
          }
          linkWidth={(link: LinkObject) =>
            (link as GraphLink).strength === "strong"
              ? 2.5
              : (link as GraphLink).strength === "ok"
                ? 1.75
                : 1.2
          }
          backgroundColor="#0f1118"
          linkDirectionalParticles={0}
          cooldownTicks={100}
        />
      )}
    </div>
  );
}
