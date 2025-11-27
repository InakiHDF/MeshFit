export type Category = "top" | "bottom" | "shoes" | "outerwear" | "accessory";
export type Fit = "slim" | "regular" | "oversized" | "wide" | null;
export type Pattern = "solid" | "striped" | "checkered" | "graphic" | "other";
export type Strength = "strong" | "ok" | "weak";

export type PrendaInput = {
  name: string;
  category: Category;
  mainColor: string;
  secondaryColors: string[];
  formality: number;
  styleTags: string[];
  fit: Fit;
  warmth: number;
  pattern: Pattern;
  fabric: string;
  seasonTags: string[];
  notes?: string | null;
  imageUrl?: string | null;
};

export type Prenda = PrendaInput & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
};

export type LinkInput = {
  prendaAId: string;
  prendaBId: string;
  strength: Strength;
  contextTags: string[];
  notes?: string | null;
};

export type Link = LinkInput & {
  id: string;
  createdAt: Date;
};

export type Outfit = {
  id: string;
  prendasIds: string[];
  occasion: string;
  description: string;
  aiModel?: string | null;
  createdAt: Date;
};

export type GenerateOutfitsPayload = {
  occasion: string;
  formalidadObjetivo?: number | null;
  clima?: string | null;
  requiredPrendaIds?: string[];
};
