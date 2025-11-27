# MeshFit MVP

App Router (Next.js 14 + TypeScript + Tailwind + shadcn/ui) para gestionar un guardarropa como grafo y generar outfits locales respetando la regla de clique completa.

## Requisitos
- Node >= 20 (se instaló un Node portátil en `node20b/node-v20.11.1-win-x64` si tu sistema sigue en Node 16).
- npm.

## Scripts
```bash
# instalar deps
npm install

# crear DB local + seed de ejemplo
npm run db:seed

# dev
npm run dev
```

Si tu PATH sigue en Node 16, ejecutá los scripts con el binario portátil, por ejemplo:
```
.\node20b\node-v20.11.1-win-x64\npm.cmd run dev
```

## Endpoints clave
- `/api/wardrobe` CRUD de prendas.
- `/api/graph` CRUD de links de compatibilidad.
- `/api/outfits/generate` generador local (sin IA) que valida clique completa.
- `/api/outfits` guardar/leer outfits.

## Notas
- La base local usa SQLite (`prisma/dev.db`). No se trackea en git.
- UI construida sólo con componentes shadcn/ui y React Query.
