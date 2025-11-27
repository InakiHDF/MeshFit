import { PrismaClient } from "@prisma/client";
import { stringifyArray } from "../lib/utils";

const prisma = new PrismaClient();

async function ensureTables() {
  await prisma.$executeRawUnsafe("PRAGMA foreign_keys = ON;");

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Prenda" (
      "id" TEXT PRIMARY KEY,
      "name" TEXT NOT NULL,
      "category" TEXT NOT NULL,
      "mainColor" TEXT NOT NULL,
      "secondaryColors" TEXT NOT NULL DEFAULT '[]',
      "formality" INTEGER NOT NULL,
      "styleTags" TEXT NOT NULL DEFAULT '[]',
      "fit" TEXT,
      "warmth" INTEGER NOT NULL,
      "pattern" TEXT NOT NULL,
      "fabric" TEXT NOT NULL,
      "seasonTags" TEXT NOT NULL DEFAULT '[]',
      "notes" TEXT,
      "imageUrl" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Link" (
      "id" TEXT PRIMARY KEY,
      "prendaAId" TEXT NOT NULL,
      "prendaBId" TEXT NOT NULL,
      "strength" TEXT NOT NULL,
      "contextTags" TEXT NOT NULL DEFAULT '[]',
      "notes" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Link_prendaAId_prendaBId_key" UNIQUE("prendaAId", "prendaBId"),
      FOREIGN KEY ("prendaAId") REFERENCES "Prenda"("id") ON DELETE CASCADE ON UPDATE CASCADE,
      FOREIGN KEY ("prendaBId") REFERENCES "Prenda"("id") ON DELETE CASCADE ON UPDATE CASCADE
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Outfit" (
      "id" TEXT PRIMARY KEY,
      "prendasIds" TEXT NOT NULL,
      "occasion" TEXT NOT NULL,
      "description" TEXT NOT NULL,
      "aiModel" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

async function seed() {
  await ensureTables();

  const existing = await prisma.prenda.count();
  if (existing > 0) {
    console.log("Prendas ya cargadas, omito seed.");
    return;
  }

  const prendas = await prisma.prenda.createMany({
    data: [
      {
        id: "top-basic-tee",
        userId: "seed-user",
        name: "Remera blanca premium",
        category: "top",
        mainColor: "blanco",
        secondaryColors: stringifyArray([]),
        formality: 2,
        styleTags: stringifyArray(["minimal", "casual"]),
        fit: "regular",
        warmth: 1,
        pattern: "solid",
        fabric: "algodón orgánico",
        seasonTags: stringifyArray(["verano", "primavera"]),
        notes: null,
        imageUrl: null,
      },
      {
        id: "bottom-jeans",
        userId: "seed-user",
        name: "Jeans negros slim",
        category: "bottom",
        mainColor: "negro",
        secondaryColors: stringifyArray([]),
        formality: 2,
        styleTags: stringifyArray(["streetwear", "casual"]),
        fit: "slim",
        warmth: 2,
        pattern: "solid",
        fabric: "denim",
        seasonTags: stringifyArray(["otoño", "invierno"]),
        notes: null,
        imageUrl: null,
      },
      {
        id: "shoes-sneakers",
        userId: "seed-user",
        name: "Zapatillas blancas minimal",
        category: "shoes",
        mainColor: "blanco",
        secondaryColors: stringifyArray(["gris"]),
        formality: 2,
        styleTags: stringifyArray(["minimal", "urbano"]),
        fit: null,
        warmth: 1,
        pattern: "solid",
        fabric: "cuero",
        seasonTags: stringifyArray(["todo el año"]),
        notes: null,
        imageUrl: null,
      },
      {
        id: "outer-navy-blazer",
        userId: "seed-user",
        name: "Blazer azul marino",
        category: "outerwear",
        mainColor: "azul marino",
        secondaryColors: stringifyArray([]),
        formality: 4,
        styleTags: stringifyArray(["smart", "office"]),
        fit: "regular",
        warmth: 2,
        pattern: "solid",
        fabric: "lana",
        seasonTags: stringifyArray(["primavera", "otoño"]),
        notes: null,
        imageUrl: null,
      },
      {
        id: "acc-leather-belt",
        userId: "seed-user",
        name: "Cinturón cuero marrón",
        category: "accessory",
        mainColor: "marrón",
        secondaryColors: stringifyArray([]),
        formality: 3,
        styleTags: stringifyArray(["smart", "casual"]),
        fit: null,
        warmth: 1,
        pattern: "solid",
        fabric: "cuero",
        seasonTags: stringifyArray(["todo el año"]),
        notes: null,
        imageUrl: null,
      },
      {
        id: "bottom-chinos",
        userId: "seed-user",
        name: "Chino beige",
        category: "bottom",
        mainColor: "beige",
        secondaryColors: stringifyArray([]),
        formality: 3,
        styleTags: stringifyArray(["smart", "minimal"]),
        fit: "regular",
        warmth: 2,
        pattern: "solid",
        fabric: "algodón",
        seasonTags: stringifyArray(["primavera", "verano", "otoño"]),
        notes: null,
        imageUrl: null,
      },
      {
        id: "top-hoodie",
        userId: "seed-user",
        name: "Buzo gris melange",
        category: "top",
        mainColor: "gris",
        secondaryColors: stringifyArray([]),
        formality: 1,
        styleTags: stringifyArray(["streetwear", "casual"]),
        fit: "oversized",
        warmth: 3,
        pattern: "solid",
        fabric: "fleece",
        seasonTags: stringifyArray(["otoño", "invierno"]),
        notes: null,
        imageUrl: null,
      },
      {
        id: "shoes-boots",
        userId: "seed-user",
        name: "Botas Chelsea cuero",
        category: "shoes",
        mainColor: "marrón",
        secondaryColors: stringifyArray([]),
        formality: 3,
        styleTags: stringifyArray(["smart", "minimal"]),
        fit: null,
        warmth: 2,
        pattern: "solid",
        fabric: "cuero",
        seasonTags: stringifyArray(["otoño", "invierno"]),
        notes: null,
        imageUrl: null,
      },
    ],
  });

  console.log(`Creadas ${prendas.count} prendas`);

  await prisma.link.createMany({
    data: [
      {
        id: "link-tee-jeans",
        userId: "seed-user",
        prendaAId: "bottom-jeans",
        prendaBId: "top-basic-tee",
        strength: "strong",
        contextTags: stringifyArray(["casual"]),
        notes: "Combo base neutro",
      },
      {
        id: "link-tee-sneakers",
        userId: "seed-user",
        prendaAId: "shoes-sneakers",
        prendaBId: "top-basic-tee",
        strength: "strong",
        contextTags: stringifyArray(["casual"]),
        notes: null,
      },
      {
        id: "link-jeans-sneakers",
        userId: "seed-user",
        prendaAId: "bottom-jeans",
        prendaBId: "shoes-sneakers",
        strength: "ok",
        contextTags: stringifyArray(["casual"]),
        notes: null,
      },
      {
        id: "link-tee-chino",
        userId: "seed-user",
        prendaAId: "bottom-chinos",
        prendaBId: "top-basic-tee",
        strength: "strong",
        contextTags: stringifyArray(["smart casual"]),
        notes: null,
      },
      {
        id: "link-chino-chelsea",
        userId: "seed-user",
        prendaAId: "bottom-chinos",
        prendaBId: "shoes-boots",
        strength: "strong",
        contextTags: stringifyArray(["smart"]),
        notes: null,
      },
      {
        id: "link-tee-belt",
        userId: "seed-user",
        prendaAId: "top-basic-tee",
        prendaBId: "acc-leather-belt",
        strength: "ok",
        contextTags: stringifyArray([]),
        notes: null,
      },
      {
        id: "link-chino-belt",
        userId: "seed-user",
        prendaAId: "bottom-chinos",
        prendaBId: "acc-leather-belt",
        strength: "ok",
        contextTags: stringifyArray(["smart"]),
        notes: null,
      },
      {
        id: "link-blazer-tee",
        userId: "seed-user",
        prendaAId: "outer-navy-blazer",
        prendaBId: "top-basic-tee",
        strength: "ok",
        contextTags: stringifyArray(["smart casual"]),
        notes: null,
      },
      {
        id: "link-blazer-chino",
        userId: "seed-user",
        prendaAId: "outer-navy-blazer",
        prendaBId: "bottom-chinos",
        strength: "strong",
        contextTags: stringifyArray(["smart"]),
        notes: null,
      },
      {
        id: "link-blazer-boots",
        userId: "seed-user",
        prendaAId: "outer-navy-blazer",
        prendaBId: "shoes-boots",
        strength: "ok",
        contextTags: stringifyArray(["smart"]),
        notes: null,
      },
      {
        id: "link-hoodie-jeans",
        userId: "seed-user",
        prendaAId: "top-hoodie",
        prendaBId: "bottom-jeans",
        strength: "strong",
        contextTags: stringifyArray(["casual", "street"]),
        notes: null,
      },
      {
        id: "link-hoodie-sneakers",
        userId: "seed-user",
        prendaAId: "top-hoodie",
        prendaBId: "shoes-sneakers",
        strength: "strong",
        contextTags: stringifyArray(["casual"]),
        notes: null,
      },
    ],
  });

  console.log("Links iniciales creados");
}

seed()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
