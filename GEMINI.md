# MeshFit – GEMINI.md  
Guía maestra del proyecto  
Versión 1.0

---

## 0. Resumen del proyecto

MeshFit es una aplicación web que permite gestionar un guardarropa como una **red de compatibilidades** entre prendas.

- Cada prenda es un **nodo**.
- Las compatibilidades entre prendas se representan como **links** en un grafo.
- Una **IA estilista** genera outfits válidos usando:
  - los links definidos manualmente,
  - información estructurada de cada prenda,
  - una descripción de la ocasión,
  - restricciones (“usar sí o sí esta prenda”),
  - reglas de estilo, color y formalidad.

MeshFit se construye con **Next.js + TypeScript**, utiliza **Supabase (Postgres)** como base de datos, emplea **shadcn/ui** como sistema de componentes y se deploya en **Vercel**.

Este documento define **toda** la arquitectura conceptual y técnica del proyecto y debe ser respetado por cualquier asistente de código (Codex, Claude, Gemini, etc.).

---

# 1. Stack tecnológico

## 1.1 Frontend
- **Next.js 14+ (App Router)**
- **TypeScript**
- **TailwindCSS** como sistema principal de estilos.
- **shadcn/ui** como librería de componentes reutilizables (basada en Radix UI).
- **Lucide Icons** para iconografía.
- **TanStack React Query** para manejo de datos y caching.
- **Zustand** para estado global opcional.
- **react-force-graph**, **reactflow** o **Cytoscape.js** para el editor de grafo.
- **Zod** para validaciones.

## 1.2 Backend
- Backend integrado en Next.js mediante **Route Handlers**.
- Rutas bajo `/app/api/**`.

## 1.3 Base de datos – Supabase (Postgres)
Supabase se usa por:

- su modelo relacional (ideal para representar grafos),
- integración natural con Prisma,
- rendimiento superior para consultas complejas,
- capacidad de escalar fácilmente,
- mejor experiencia en Next.js que Firebase para este tipo de datos.

**ORM:** Prisma  
**Migraciones:** prisma migrate

---

# 2. Estructura del proyecto

Recomendada:

```
meshfit/
 ├─ app/
 │   ├─ layout.tsx
 │   ├─ page.tsx
 │   ├─ wardrobe/              // CRUD de prendas
 │   ├─ graph/                 // editor del grafo
 │   ├─ outfits/               // generador con IA
 │   └─ api/
 │       ├─ wardrobe/
 │       ├─ graph/
 │       ├─ outfits/
 │       └─ ai/
 ├─ components/
 │   ├─ ui/                    // componentes shadcn
 │   └─ meshfit/               // componentes específicos
 ├─ lib/
 │   ├─ db.ts
 │   ├─ ai.ts
 │   ├─ outfitRules.ts
 │   ├─ colorUtils.ts
 │   ├─ types.ts
 │   └─ validators.ts
 ├─ prisma/
 │   └─ schema.prisma
 ├─ public/
 ├─ GEMINI.md
 ├─ README.md
 ├─ package.json
 └─ tsconfig.json
```

---

# 3. Modelo de dominio

## 3.1 Categorías de prendas

Cada prenda pertenece a una sola categoría:

- `top` – remeras, buzos, camisas, etc.
- `bottom` – pantalones, jeans, joggers, shorts.
- `shoes` – zapatillas, zapatos, botas.
- `outerwear` – camperas, sacos, abrigos.
- `accessory` – relojes, cinturones, gorros, etc.

## 3.2 Entidad Prenda

Representa una prenda con atributos suficientes para que la IA entienda estilo, color, formalidad, etc.

```
Prenda {
  id: string
  name: string
  category: 'top' | 'bottom' | 'shoes' | 'outerwear' | 'accessory'

  mainColor: string
  secondaryColors: string[]

  formality: number        // 1–5
  styleTags: string[]      // ej: ["streetwear", "minimal"]

  fit: 'slim' | 'regular' | 'oversized' | 'wide' | null
  warmth: number           // 1–5
  pattern: 'solid' | 'striped' | 'checkered' | 'graphic' | 'other'
  fabric: string

  seasonTags: string[]
  notes: string | null
  imageUrl: string | null

  createdAt: Date
  updatedAt: Date
}
```

## 3.3 Entidad Link (compatibilidad)

```
Link {
  id: string
  prendaAId: string
  prendaBId: string

  strength: 'strong' | 'ok' | 'weak'
  contextTags: string[]    // opcional
  notes: string | null

  createdAt: Date
}
```

Un link expresa compatibilidad visual/estilística entre dos prendas.

## 3.4 Entidad Outfit

```
Outfit {
  id: string
  prendasIds: string[]
  occasion: string
  description: string
  aiModel: string
  createdAt: Date
}
```

---

# 4. Reglas de negocio

## 4.1 Composición mínima de outfits
- Obligatorio:  
  - 1 top  
  - 1 bottom  
  - 1 shoes

- Opcional:  
  - 0–1 outerwear  
  - 0–3 accessories

## 4.2 Regla del grafo (compatibilidad estricta)

Un outfit válido debe cumplir:

> Toda pareja de prendas dentro del outfit debe tener un Link existente.

Esto equivale a una **clique completa** en terminología de grafos.

La IA **no puede violar esta regla**.

## 4.3 Formalidad

- Rango permitido dentro del outfit no debe ser extremo (ej: mezclar 1 con 5 solo bajo pedido explícito).
- Se puede usar heurística: rango máximo de formalidad permitido = 2.

## 4.4 Color y estilo

Heurísticas:

- Neutrales siempre combinan.
- Evitar demasiados colores fuertes sin relación.
- Considerar contraste top/bottom.
- Evitar mezcla de patrones conflictivos.
- Tener en cuenta `styleTags`.

## 4.5 Clima y temporada

La IA debe usar:

- `warmth`: nivel de abrigo,
- `seasonTags`: estación.

---

# 5. IA estilista

## 5.1 Rol
La IA actúa como un estilista experto que:

- entiende regulaciones del grafo,
- entiende estilo, color, formalidad,
- propone outfits,
- explica brevemente cada propuesta.

## 5.2 Prohibiciones para la IA
- No inventar prendas.
- No combinar prendas sin link.
- No modificar campos de prendas.
- No agregar links automáticos.
- No ignorar formalidad/clima sin pedido expreso.

## 5.3 Prompt base (conceptual)

El servidor enviará un prompt estructurado:

**"Sos MeshFit AI, un estilista experto en moda y composición visual.  
Recibís el guardarropa del usuario como una lista de prendas y una lista de links de compatibilidad.  
Debés generar outfits válidos siguiendo estas reglas:

1. No inventar prendas ni combinar prendas sin links.
2. Respetar las prendas obligatorias.
3. Mantener coherencia de estilo, color, formalidad y clima.
4. Devolver el resultado en JSON: lista de outfits, cada uno con ids de prendas y una breve explicación."**

---

# 6. UI y estética

## 6.1 Paleta y estética general
- Estilo minimalista, moderno, limpio.
- Paleta recomendada:
  - fondo oscuro #0b0b0f
  - texto blanco/crema
  - grises neutros
  - un solo color de acento
- Transiciones suaves (Tailwind transitions).

## 6.2 shadcn/ui – Reglas obligatorias
Todos los componentes UI deben provenir de shadcn o extenderse desde ahí.

Usar:
- Button
- Input
- Card
- Dialog
- Select
- Dropdown
- Sheet
- Tabs
- Toast

No usar Material UI, Chakra, Bootstrap ni librerías externas que entren en conflicto.

## 6.3 Editor de grafo
- Nodos: color por categoría.
- Edges: grosor/color según `strength`.
- Interacción:
  - click en nodo
  - click en nodo A – nodo B → crear/eliminar link
  - arrastre de nodos

---

# 7. API interna

## `/api/wardrobe`
- GET: todas las prendas
- POST: crear prenda
- PATCH: editar
- DELETE: eliminar

## `/api/graph`
- GET: links
- POST: crear link
- DELETE: eliminar link

## `/api/outfits/generate`
- Input: ocasión, formalidad, clima, prendas obligatorias…
- Output: outfits generados por IA

## `/api/outfits`
- GET: lista de outfits guardados
- POST: guardar un outfit

---

# 8. Reglas para Gemini / Asistentes de Código

Gemini debe:

1. **Leer este archivo antes de generar código.**
2. Escribir todo en **TypeScript**.
3. Usar **Prisma** para DB, no SQL crudo (salvo casos excepcionales).
4. Respetar el modelo de datos tal cual.
5. No inventar campos ni estructuras.
6. No introducir librerías externas sin autorización.
7. Usar componentes shadcn para toda la interfaz.
8. Mantener arquitectura modular.
9. Validar inputs con Zod.

---

# 9. Roadmap técnico

## V1 – MVP
- CRUD de prendas.
- Editor de grafo funcional.
- Lógica local de generación de outfits (sin IA, solo grafo).

## V2 – IA estilista
- Integrar IA.
- Generación real de outfits desde `/outfits`.

## V3 – Mejoras
- Favoritos.
- Outfits guardados.
- Sugerencias inteligentes.

---

# 10. Extensiones futuras (ideas)
- Multiusuario.
- Subir foto → generar prenda automáticamente.
- Modo guardarropa cápsula.
- Exportar outfits como imagen.

---

# 11. Filosofía de MeshFit

- **El grafo es la verdad absoluta.**
- **La IA es asistente, no creadora del guardarropa.**
- **La estética debe ser limpia, moderna y consistente.**
- **Toda decisión técnica debe mantener MeshFit simple y escalable.**
