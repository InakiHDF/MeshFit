import { type Link, type Prenda } from "./types";

type Graph = Map<string, Set<string>>;

function buildGraph(links: Link[]): Graph {
  const graph: Graph = new Map();
  links.forEach((link) => {
    const setA = graph.get(link.prendaAId) ?? new Set<string>();
    setA.add(link.prendaBId);
    graph.set(link.prendaAId, setA);

    const setB = graph.get(link.prendaBId) ?? new Set<string>();
    setB.add(link.prendaAId);
    graph.set(link.prendaBId, setB);
  });
  return graph;
}

export function isClique(ids: string[], graph: Graph) {
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      const neighbors = graph.get(ids[i]);
      if (!neighbors?.has(ids[j])) {
        return false;
      }
    }
  }
  return true;
}

function formalidadOk(prendas: Prenda[], objetivo?: number | null) {
  const values = prendas.map((p) => p.formality);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const rangeOk = max - min <= 2;
  if (!objetivo) return rangeOk;
  const promedio = values.reduce((acc, val) => acc + val, 0) / values.length;
  return rangeOk && Math.abs(promedio - objetivo) <= 2;
}

function compatibleWithAll(candidateId: string, currentIds: string[], graph: Graph) {
  const neighbors = graph.get(candidateId);
  if (!neighbors) return false;
  return currentIds.every((id) => neighbors.has(id));
}

function uniqueKey(ids: string[]) {
  return [...ids].sort().join("-");
}

function describeOutfit(prendas: Prenda[], occasion: string) {
  const top = prendas.find((p) => p.category === "top");
  const bottom = prendas.find((p) => p.category === "bottom");
  const shoes = prendas.find((p) => p.category === "shoes");
  const outer = prendas.find((p) => p.category === "outerwear");
  const accessories = prendas.filter((p) => p.category === "accessory");

  const parts: string[] = [];
  if (top && bottom && shoes) {
    parts.push(
      `${top.name} + ${bottom.name} + ${shoes.name}${
        outer ? ` + ${outer.name}` : ""
      }`,
    );
  }
  if (accessories.length) {
    parts.push(`Accesorios: ${accessories.map((a) => a.name).join(", ")}`);
  }
  parts.push(`Ocasión: ${occasion}`);
  return parts.join(" · ");
}

export function generateLocalOutfits(params: {
  prendas: Prenda[];
  links: Link[];
  occasion: string;
  formalidadObjetivo?: number | null;
  requiredPrendaIds?: string[];
}) {
  const { prendas, links, occasion, formalidadObjetivo, requiredPrendaIds = [] } = params;
  const graph = buildGraph(links);
  const prendaById = new Map(prendas.map((p) => [p.id, p]));

  const requiredExisting = requiredPrendaIds
    .map((id) => prendaById.get(id))
    .filter(Boolean) as Prenda[];
  const requiredIds = requiredExisting.map((p) => p.id);

  const tops = prendas.filter((p) => p.category === "top");
  const bottoms = prendas.filter((p) => p.category === "bottom");
  const shoes = prendas.filter((p) => p.category === "shoes");
  const outerwear = prendas.filter((p) => p.category === "outerwear");
  const accessories = prendas.filter((p) => p.category === "accessory");

  const results: { prendasIds: string[]; description: string }[] = [];
  const seen = new Set<string>();

  for (const top of tops) {
    for (const bottom of bottoms) {
      for (const shoe of shoes) {
        const baseIds = Array.from(new Set([...requiredIds, top.id, bottom.id, shoe.id]));
        if (!isClique(baseIds, graph)) continue;

        const basePrendas = baseIds
          .map((id) => prendaById.get(id))
          .filter(Boolean) as Prenda[];
        if (!formalidadOk(basePrendas, formalidadObjetivo)) continue;

        const basesToExpand = [baseIds];

        // Outerwear 0..1
        const withOuterwear: string[][] = [];
        for (const ids of basesToExpand) {
          withOuterwear.push(ids);
          for (const outer of outerwear) {
            if (!compatibleWithAll(outer.id, ids, graph)) continue;
            const expanded = [...ids, outer.id];
            if (isClique(expanded, graph)) {
              withOuterwear.push(expanded);
            }
          }
        }

        // Accessories up to 2 for now to avoid combinatorial explosion
        const withAccessories: string[][] = [];
        for (const ids of withOuterwear) {
          withAccessories.push(ids);
          const compatibleAccessories = accessories.filter((acc) =>
            compatibleWithAll(acc.id, ids, graph),
          );
          for (const acc of compatibleAccessories) {
            const once = [...ids, acc.id];
            if (!isClique(once, graph)) continue;
            withAccessories.push(once);
            for (const acc2 of compatibleAccessories) {
              if (acc2.id === acc.id) continue;
              const twice = [...ids, acc.id, acc2.id];
              if (isClique(twice, graph)) {
                withAccessories.push(twice);
              }
            }
          }
        }

        for (const ids of withAccessories) {
          const prendasSet = Array.from(new Set(ids));
          const prendasObjs = prendasSet
            .map((id) => prendaById.get(id))
            .filter(Boolean) as Prenda[];
          if (!formalidadOk(prendasObjs, formalidadObjetivo)) continue;

          const key = uniqueKey(prendasSet);
          if (seen.has(key)) continue;
          seen.add(key);

          const description = describeOutfit(prendasObjs, occasion);
          results.push({ prendasIds: prendasSet, description });
        }
      }
    }
  }

  // Sort to surface options closer to formalidad objetivo and with fewer items
  const scored = results.map((item) => {
    const prendasObjs = item.prendasIds
      .map((id) => prendaById.get(id))
      .filter(Boolean) as Prenda[];
    const avgFormality =
      prendasObjs.reduce((acc, p) => acc + p.formality, 0) /
      Math.max(prendasObjs.length, 1);
    const distance = formalidadObjetivo
      ? Math.abs(avgFormality - formalidadObjetivo)
      : 0;
    const score = distance * 2 + prendasObjs.length * 0.1;
    return { ...item, score };
  });

  scored.sort((a, b) => a.score - b.score);
  return scored.slice(0, 12);
}
