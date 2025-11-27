# MeshFit – Documentación Maestra (V2)
**Estado:** MVP Funcional (Pre-Alpha)
**Versión:** 2.0.0
**Fecha de actualización:** 27/11/2025

---

## 1. Resumen del proyecto

MeshFit es una aplicación web para gestionar guardarropas digitales como una **red de nodos interconectados**.
Permite a los usuarios subir sus prendas, definir conexiones (compatibilidad) entre ellas y generar outfits basados en esas conexiones.

**Filosofía V2:**
- **Clean UI:** Interfaz minimalista, clara y funcional.
- **User-Centric:** Todo pertenece a un usuario autenticado.
- **Postgres-First:** La base de datos es la fuente de la verdad.

---

## 2. Stack Tecnológico (Confirmado)

- **Frontend:** Next.js 14 (App Router), React, TailwindCSS, Shadcn/UI.
- **Backend:** Next.js Route Handlers (`/api/**`).
- **Base de Datos:** Supabase (PostgreSQL).
- **ORM:** Prisma (con soporte para PgBouncer).
- **Autenticación:** Supabase Auth (SSR & Client).
- **Deploy:** Vercel.

---

## 3. Arquitectura y Estructura

```
meshfit/
 ├─ app/
 │   ├─ layout.tsx            // Providers globales
 │   ├─ page.tsx              // Dashboard principal (Sidebar + Vistas)
 │   ├─ login/                // Página de autenticación
 │   ├─ auth/callback/        // Handler de OAuth
 │   └─ api/                  // Endpoints (wardrobe, graph, outfits)
 ├─ components/
 │   ├─ ui/                   // Componentes base (shadcn)
 │   ├─ wardrobe/             // Componentes específicos (ColorSelector, Wizard)
 │   └─ graph-canvas.tsx      // Visualización del grafo
 ├─ lib/
 │   ├─ db.ts                 // Instancia de Prisma
 │   ├─ supabase/             // Clientes de Supabase (Client/Server/Middleware)
 │   └─ validators.ts         // Esquemas Zod
 ├─ prisma/
 │   └─ schema.prisma         // Definición de tablas
 └─ GEMINI.md                 // Este archivo
```

---

## 4. Configuración Crítica (Deploy)

Para que el proyecto funcione en Vercel, las variables de entorno son **CRÍTICAS**:

| Variable | Descripción | Formato Ejemplo |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto | `https://xyz.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública | `eyJ...` |
| `DATABASE_URL` | Conexión para el Pooler (Transaction) | `postgres://...:6543/postgres?pgbouncer=true` |
| `DIRECT_URL` | Conexión Directa (Session) | `postgres://...:5432/postgres` |

**Nota Importante:** Sin `?pgbouncer=true` en `DATABASE_URL`, Prisma fallará con errores de "prepared statement".

---

## 5. Modelo de Datos Actual (PostgreSQL)

Todas las tablas incluyen `userId` para aislar los datos por usuario.

### 5.1 Tabla `Prenda`
- `id` (PK): Cuid
- `userId`: UUID del usuario (Supabase)
- `name`: Texto
- `category`: 'top' | 'bottom' | 'shoes' | 'outerwear' | 'accessory'
- `mainColor`: Texto (Seleccionado de paleta)
- `secondaryColors`: JSON String `[]`
- `formality`: Int (1-5)
- `warmth`: Int (1-5)
- `fit`: 'slim' | 'regular' | 'oversized' | 'wide' | null
- `fabric`: Texto
- `pattern`: 'solid' | 'striped' | ...
- `imageUrl`: Texto (URL o null)

### 5.2 Tabla `Link`
- `prendaAId` & `prendaBId`: FKs a Prenda
- `strength`: 'strong' | 'ok' | 'weak'
- `contextTags`: JSON String

---

## 6. Estado del Desarrollo

### ✅ Completado (Funcional)
- [x] **Infraestructura:** Setup de Next.js, Prisma, Supabase y Vercel funcionando.
- [x] **Autenticación:** Login/Registro con email funciona correctamente.
- [x] **CRUD Prendas:** Se pueden crear y eliminar prendas.
- [x] **Base de Datos:** Tablas creadas y conectadas con PgBouncer.
- [x] **UI Dashboard:** Nuevo diseño limpio con sidebar y navegación por estados.
- [x] **Wizard de Carga:** Modal mejorado con selectores visuales (ColorSelector).

### 🚧 En Progreso / Por Mejorar
- [ ] **Grafo Interactivo:** Actualmente solo visualiza nodos. Falta poder crear links haciendo click/drag entre nodos.
- [ ] **Datos de Prenda:** El modelo es básico. Faltan campos más ricos (marca, talle, estado, precio, fecha de compra).
- [ ] **Imágenes:** El campo `imageUrl` existe pero no hay subida de archivos real (Storage).
- [ ] **Edición:** El formulario de edición sigue usando el diseño viejo/básico. Debe migrarse al Wizard.

### 📅 Roadmap Futuro
1.  **Interacción del Grafo:** Permitir conectar prendas visualmente.
2.  **Subida de Imágenes:** Integrar Supabase Storage para subir fotos reales de la ropa.
3.  **Refinar Datos:** Expandir el esquema de `Prenda` para ser más útil (ej: diferenciar subtipos de prendas).
4.  **IA Estilista:** Conectar la API de generación de outfits (`/api/outfits/generate`) con un LLM real.

---

## 7. Reglas para el Asistente (Gemini)

1.  **Siempre leer este archivo** antes de proponer cambios arquitectónicos.
2.  **Respetar Supabase Auth:** Todo acceso a datos debe validar `getUser()` en el servidor.
3.  **Usar Zod:** Validar siempre inputs en cliente y servidor.
4.  **Estética:** Mantener el estilo "Clean/Minimal" (Fondo blanco/gris, bordes suaves, acentos en negro).
5.  **No romper el build:** Verificar siempre importaciones y tipos antes de sugerir código.

---