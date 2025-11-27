import { z } from "zod";

const categoryValues = ["top", "bottom", "shoes", "outerwear", "accessory"] as const;
const fitValues = ["slim", "regular", "oversized", "wide"] as const;
const patternValues = ["solid", "striped", "checkered", "graphic", "other"] as const;
const strengthValues = ["strong", "ok", "weak"] as const;

const stringArray = z
  .array(z.string().trim().min(1))
  .optional()
  .default([])
  .transform((arr) => arr.map((item) => item.trim()).filter(Boolean));

export const prendaSchema = z.object({
  name: z.string().trim().min(2),
  category: z.enum(categoryValues),
  mainColor: z.string().trim().min(1),
  secondaryColors: stringArray,
  formality: z.number().int().min(1).max(5),
  styleTags: stringArray,
  fit: z
    .enum(fitValues)
    .nullable()
    .optional()
    .transform((val) => val ?? null),
  warmth: z.number().int().min(1).max(5),
  pattern: z.enum(patternValues),
  fabric: z.string().trim().min(1),
  seasonTags: stringArray,
  notes: z
    .string()
    .trim()
    .optional()
    .transform((val) => (val && val.length ? val : null)),
  imageUrl: z
    .string()
    .trim()
    .url()
    .optional()
    .or(z.literal(""))
    .transform((val) => (val && val.length ? val : null)),
});

export const linkSchema = z
  .object({
    prendaAId: z.string().cuid(),
    prendaBId: z.string().cuid(),
    strength: z.enum(strengthValues),
    contextTags: stringArray,
    notes: z
      .string()
      .trim()
      .optional()
      .transform((val) => (val && val.length ? val : null)),
  })
  .refine((data) => data.prendaAId !== data.prendaBId, {
    message: "No puedes linkear la misma prenda consigo misma.",
    path: ["prendaBId"],
  });

export const generateOutfitsSchema = z.object({
  occasion: z.string().trim().min(2),
  formalidadObjetivo: z.number().int().min(1).max(5).nullable().optional(),
  clima: z.string().trim().optional().nullable(),
  requiredPrendaIds: z.array(z.string().cuid()).optional().default([]),
});

export const saveOutfitSchema = z.object({
  prendasIds: z.array(z.string().cuid()).min(3),
  occasion: z.string().trim().min(2),
  description: z.string().trim().min(3),
  aiModel: z.string().trim().optional().nullable(),
});
