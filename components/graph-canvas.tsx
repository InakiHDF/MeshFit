"use client";

import { useMemo } from "react";
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
    <div className="h-[420px] w-full rounded-xl border border-white/5 bg-[#0f1118]">
      <ForceGraph2D
        graphData={data}
        nodeLabel={(node) => (node as GraphNode).name}
        nodeCanvasObject={(node: NodeObject, ctx, globalScale) => {
          const typed = node as GraphNode;
          const label = typed.name;
          const color = categoryColor[typed.category] ?? "#94a3b8";
          const radius = selectedIds.includes(typed.id) ? 10 : 8;

          ctx.beginPath();
          ctx.arc(node.x ?? 0, node.y ?? 0, radius, 0, 2 * Math.PI, false);
          ctx.fillStyle = color;
          ctx.fill();
          if (selectedIds.includes(typed.id)) {
            ctx.strokeStyle = "#38bdf8";
            ctx.lineWidth = 2;
            ctx.stroke();
          }

          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px Inter, system-ui`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "#e2e8f0";
          ctx.fillText(label, (node.x ?? 0) + 12, node.y ?? 0);
        }}
        onNodeClick={(node) => onNodeSelect?.((node as GraphNode).id)}
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
        cooldownTicks={90}
        warmupTicks={30}
      />
    </div>
  );
}
