import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { type Category, type Link, type Outfit, type Prenda } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseStringArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function stringifyArray(value: string[] = []): string {
  return JSON.stringify(value);
}

export type PrismaPrendaRecord = {
  id: string;
  name: string;
  category: string;
  mainColor: string;
  secondaryColors: string | null;
  formality: number;
  styleTags: string | null;
  fit: string | null;
  warmth: number;
  pattern: string;
  fabric: string;
  seasonTags: string | null;
  notes: string | null;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type PrismaLinkRecord = {
  id: string;
  prendaAId: string;
  prendaBId: string;
  strength: string;
  contextTags: string | null;
  notes: string | null;
  createdAt: Date;
};

export type PrismaOutfitRecord = {
  id: string;
  prendasIds: string | null;
  occasion: string;
  description: string;
  aiModel: string | null;
  createdAt: Date;
};

export function normalizePrenda(record: PrismaPrendaRecord): Prenda {
  return {
    ...record,
    category: record.category as Category,
    secondaryColors: parseStringArray(record.secondaryColors),
    styleTags: parseStringArray(record.styleTags),
    fit: (record.fit as Prenda["fit"]) ?? null,
    pattern: record.pattern as Prenda["pattern"],
    seasonTags: parseStringArray(record.seasonTags),
  };
}

export function normalizeLink(record: PrismaLinkRecord): Link {
  return {
    ...record,
    strength: record.strength as Link["strength"],
    contextTags: parseStringArray(record.contextTags),
  };
}

export function normalizeOutfit(record: PrismaOutfitRecord): Outfit {
  return {
    ...record,
    prendasIds: parseStringArray(record.prendasIds),
  };
}
