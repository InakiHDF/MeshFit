"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Flame, Link as LinkIcon, MousePointer2, RefreshCw, Sparkles, Trash2, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { type GraphLink, type GraphNode } from "@/components/graph-canvas";
import { type Category, type Fit, type Link as LinkType, type Outfit, type Pattern, type Prenda, type Strength } from "@/lib/types";
import { generateOutfitsSchema, linkSchema, prendaSchema, saveOutfitSchema } from "@/lib/validators";
import { createClient } from "@/lib/supabase/client";

const GraphCanvas = dynamic(
  () => import("@/components/graph-canvas").then((mod) => mod.GraphCanvas),
  { ssr: false },
);

type PrendaFormValues = {
  name: string;
  category: Category;
  mainColor: string;
  secondaryColors: string;
  formality: number;
  styleTags: string;
  fit: Fit | "";
  warmth: number;
  pattern: Pattern;
  fabric: string;
  seasonTags: string;
  notes: string;
  imageUrl: string;
};

type LinkFormValues = {
  prendaAId: string;
  prendaBId: string;
  strength: Strength;
  contextTags: string;
  notes: string;
};

type GeneratedOutfit = {
  prendasIds: string[];
  description: string;
  score?: number;
};

const categories: { value: Category; label: string }[] = [
  { value: "top", label: "Top" },
  { value: "bottom", label: "Bottom" },
  { value: "shoes", label: "Calzado" },
  { value: "outerwear", label: "Abrigo" },
  { value: "accessory", label: "Accesorio" },
];

const fits: { value: Exclude<Fit, null>; label: string }[] = [
  { value: "slim", label: "Slim" },
  { value: "regular", label: "Regular" },
  { value: "oversized", label: "Oversize" },
  { value: "wide", label: "Wide" },
];

const patterns: { value: Pattern; label: string }[] = [
  { value: "solid", label: "Liso" },
  { value: "striped", label: "Rayas" },
  { value: "checkered", label: "Cuadrille" },
  { value: "graphic", label: "Grafico" },
  { value: "other", label: "Otro" },
];

const strengths: { value: Strength; label: string }[] = [
  { value: "strong", label: "Fuerte" },
  { value: "ok", label: "OK" },
  { value: "weak", label: "Debil" },
];

async function api<T>(url: string, options?: RequestInit) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    const message = (errorBody as any)?.error ?? "Error inesperado";
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

function splitList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function Home() {
  const qc = useQueryClient();
  const [selectedLinkNodes, setSelectedLinkNodes] = useState<string[]>([]);
  const [generated, setGenerated] = useState<GeneratedOutfit[]>([]);
  const [requiredPrendas, setRequiredPrendas] = useState<Set<string>>(new Set());
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const wardrobeQuery = useQuery<Prenda[]>({
    queryKey: ["wardrobe"],
    queryFn: () => api<Prenda[]>("/api/wardrobe"),
  });

  const linksQuery = useQuery<LinkType[]>({
    queryKey: ["links"],
    queryFn: () => api<LinkType[]>("/api/graph"),
  });

  const outfitsQuery = useQuery<Outfit[]>({
    queryKey: ["outfits"],
    queryFn: () => api<Outfit[]>("/api/outfits"),
  });

  const prendaForm = useForm<PrendaFormValues>({
    defaultValues: {
      name: "",
      category: "top",
      mainColor: "",
      secondaryColors: "",
      formality: 3,
      styleTags: "",
      fit: "",
      warmth: 3,
      pattern: "solid",
      fabric: "",
      seasonTags: "",
      notes: "",
      imageUrl: "",
    },
  });

  const linkForm = useForm<LinkFormValues>({
    defaultValues: {
      prendaAId: "",
      prendaBId: "",
      strength: "ok",
      contextTags: "",
      notes: "",
    },
  });
  const createPrenda = useMutation({
    mutationFn: async (values: PrendaFormValues) => {
      const payload = prendaSchema.parse({
        ...values,
        secondaryColors: splitList(values.secondaryColors),
        styleTags: splitList(values.styleTags),
        seasonTags: splitList(values.seasonTags),
        formality: Number(values.formality),
        warmth: Number(values.warmth),
        fit: values.fit || null,
      });
      return api<Prenda>("/api/wardrobe", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wardrobe"] });
      toast({ title: "Prenda creada" });
      prendaForm.reset();
    },
    onError: (err: Error) => toast({ title: "Error al crear", description: err.message }),
  });

  const updatePrenda = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: PrendaFormValues }) => {
      const payload = prendaSchema.parse({
        ...values,
        secondaryColors: splitList(values.secondaryColors),
        styleTags: splitList(values.styleTags),
        seasonTags: splitList(values.seasonTags),
        formality: Number(values.formality),
        warmth: Number(values.warmth),
        fit: values.fit || null,
      });
      return api<Prenda>(`/api/wardrobe/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wardrobe"] });
      toast({ title: "Prenda actualizada" });
    },
    onError: (err: Error) => toast({ title: "Error al actualizar", description: err.message }),
  });

  const deletePrenda = useMutation({
    mutationFn: (id: string) =>
      api(`/api/wardrobe/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wardrobe"] });
      qc.invalidateQueries({ queryKey: ["links"] });
      toast({ title: "Prenda eliminada" });
    },
    onError: (err: Error) => toast({ title: "No se pudo eliminar", description: err.message }),
  });
  const createLink = useMutation({
    mutationFn: async (values: LinkFormValues) => {
      const payload = linkSchema.parse({
        ...values,
        contextTags: splitList(values.contextTags),
      });
      return api<LinkType>("/api/graph", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["links"] });
      toast({ title: "Link creado" });
      linkForm.reset({ strength: "ok", prendaAId: "", prendaBId: "", contextTags: "", notes: "" });
    },
    onError: (err: Error) => toast({ title: "Error al crear link", description: err.message }),
  });

  const removeLink = useMutation({
    mutationFn: (id: string) =>
      api(`/api/graph/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["links"] });
      toast({ title: "Link eliminado" });
    },
    onError: (err: Error) => toast({ title: "No se pudo eliminar", description: err.message }),
  });
  const generateOutfits = useMutation({
    mutationFn: async (payload: { occasion: string; formalidadObjetivo?: number | null; requiredPrendaIds: string[] }) => {
      const parsed = generateOutfitsSchema.parse(payload);
      return api<GeneratedOutfit[]>("/api/outfits/generate", {
        method: "POST",
        body: JSON.stringify(parsed),
      });
    },
    onSuccess: (data) => {
      setGenerated(data);
      toast({ title: "Outfits generados", description: `${data.length} propuestas` });
    },
    onError: (err: Error) => toast({ title: "No se pudo generar", description: err.message }),
  });

  const saveOutfit = useMutation({
    mutationFn: (payload: { prendasIds: string[]; occasion: string; description: string }) =>
      api<Outfit>("/api/outfits", {
        method: "POST",
        body: JSON.stringify(saveOutfitSchema.parse({ ...payload, aiModel: "local-heuristic" })),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["outfits"] });
      toast({ title: "Outfit guardado" });
    },
    onError: (err: Error) => toast({ title: "No se pudo guardar", description: err.message }),
  });
  const wardrobe = wardrobeQuery.data ?? [];
  const links = linksQuery.data ?? [];

  const graphNodes: GraphNode[] = useMemo(
    () =>
      wardrobe.map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        formality: p.formality,
      })),
    [wardrobe],
  );

  const graphLinks: GraphLink[] = useMemo(
    () =>
      links.map((l) => ({
        id: l.id,
        source: l.prendaAId,
        target: l.prendaBId,
        strength: l.strength,
      })),
    [links],
  );

  const handleNodeSelect = (id: string) => {
    setSelectedLinkNodes((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev.slice(-1), id];
      if (next.length === 2) {
        linkForm.setValue("prendaAId", next[0]);
        linkForm.setValue("prendaBId", next[1]);
      }
      return next;
    });
  };
  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-gradient-to-r from-[#0c111d] via-[#0c111d] to-[#0d1b2a] p-6 shadow-xl">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">MeshFit / MVP</p>
                <h1 className="text-3xl font-semibold text-foreground">Grafo de compatibilidades + outfits</h1>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Cerrar sesión">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
          <p className="max-w-3xl text-sm text-muted-foreground">
            CRUD de prendas, editor de links y generador local respetando la regla de clique completa.
          </p>
          <div className="flex flex-wrap gap-3 text-sm">
            <Badge variant="secondary">Prendas: {wardrobe.length}</Badge>
            <Badge variant="secondary">Links: {links.length}</Badge>
            <Badge variant="secondary">Outfits: {outfitsQuery.data?.length ?? 0}</Badge>
          </div>
        </header>

        <Tabs defaultValue="wardrobe">
          <TabsList className="gap-2">
            <TabsTrigger value="wardrobe">Guardarropa</TabsTrigger>
            <TabsTrigger value="graph">Grafo</TabsTrigger>
            <TabsTrigger value="outfits">Outfits</TabsTrigger>
          </TabsList>
          <TabsContent value="wardrobe">
            <div className="grid gap-6 lg:grid-cols-[360px,1fr]">
              <Card>
                <CardHeader>
                  <CardTitle>Agregar prenda</CardTitle>
                  <CardDescription>Define color, formalidad, fit y tags.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <form
                    className="space-y-3"
                    onSubmit={prendaForm.handleSubmit((values) => createPrenda.mutate(values))}
                  >
                    <div className="space-y-1.5">
                      <Label>Nombre</Label>
                      <Input placeholder="Camisa lino beige" {...prendaForm.register("name")} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label>Categoria</Label>
                        <Select
                          value={prendaForm.watch("category")}
                          onValueChange={(value: Category) => prendaForm.setValue("category", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((c) => (
                              <SelectItem key={c.value} value={c.value}>
                                {c.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label>Formalidad (1-5)</Label>
                        <Input type="number" min={1} max={5} {...prendaForm.register("formality", { valueAsNumber: true })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label>Color principal</Label>
                        <Input placeholder="Gris" {...prendaForm.register("mainColor")} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Colores secundarios</Label>
                        <Input placeholder="Azul, blanco" {...prendaForm.register("secondaryColors")} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label>Fit</Label>
                        <Select
                          value={prendaForm.watch("fit") || "no-selection"}
                          onValueChange={(value) =>
                            prendaForm.setValue("fit", value === "no-selection" ? "" : (value as Fit))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="no-selection">N/A</SelectItem>
                            {fits.map((f) => (
                              <SelectItem key={f.value} value={f.value}>
                                {f.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label>Abrigo (1-5)</Label>
                        <Input type="number" min={1} max={5} {...prendaForm.register("warmth", { valueAsNumber: true })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label>Patron</Label>
                        <Select
                          value={prendaForm.watch("pattern")}
                          onValueChange={(value: Pattern) => prendaForm.setValue("pattern", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Patron" />
                          </SelectTrigger>
                          <SelectContent>
                            {patterns.map((p) => (
                              <SelectItem key={p.value} value={p.value}>
                                {p.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label>Material</Label>
                        <Input placeholder="Algodon" {...prendaForm.register("fabric")} />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Style tags</Label>
                      <Input placeholder="minimal, streetwear" {...prendaForm.register("styleTags")} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Temporadas</Label>
                      <Input placeholder="invierno, otono" {...prendaForm.register("seasonTags")} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Notas</Label>
                      <Textarea rows={3} {...prendaForm.register("notes")} />
                    </div>
                    <Button className="w-full" type="submit" disabled={createPrenda.isPending}>
                      {createPrenda.isPending ? "Guardando..." : "Agregar prenda"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <div className="grid gap-4 sm:grid-cols-2">
                {wardrobe.map((item) => (
                  <PrendaCard
                    key={item.id}
                    prenda={item}
                    onDelete={() => deletePrenda.mutate(item.id)}
                    onUpdate={(values) => updatePrenda.mutate({ id: item.id, values })}
                  />
                ))}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="graph">
            <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
              <Card className="space-y-4 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Grafo vivo</CardTitle>
                    <CardDescription>Click en nodos para prellenar el link.</CardDescription>
                  </div>
                  <Badge variant="muted" className="flex items-center gap-2">
                    <MousePointer2 className="h-4 w-4" /> 2 nodos
                  </Badge>
                </div>
                <GraphCanvas
                  nodes={graphNodes}
                  links={graphLinks}
                  onNodeSelect={handleNodeSelect}
                  selectedIds={selectedLinkNodes}
                />
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Crear link</CardTitle>
                  <CardDescription>Fuerza y contexto.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <form
                    className="space-y-3"
                    onSubmit={linkForm.handleSubmit((values) => createLink.mutate(values))}
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label>Prenda A</Label>
                        <Select
                          value={linkForm.watch("prendaAId")}
                          onValueChange={(value) => linkForm.setValue("prendaAId", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Elegi" />
                          </SelectTrigger>
                          <SelectContent>
                            {wardrobe.map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label>Prenda B</Label>
                        <Select
                          value={linkForm.watch("prendaBId")}
                          onValueChange={(value) => linkForm.setValue("prendaBId", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Elegi" />
                          </SelectTrigger>
                          <SelectContent>
                            {wardrobe.map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label>Fuerza</Label>
                      <Select
                        value={linkForm.watch("strength")}
                        onValueChange={(value: Strength) => linkForm.setValue("strength", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Fuerza" />
                        </SelectTrigger>
                        <SelectContent>
                          {strengths.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                              {s.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label>Contexto</Label>
                      <Input placeholder="smart casual, noche" {...linkForm.register("contextTags")} />
                    </div>
                    <div className="space-y-1">
                      <Label>Notas</Label>
                      <Textarea rows={2} {...linkForm.register("notes")} />
                    </div>
                    <Button className="w-full" type="submit" disabled={createLink.isPending}>
                      {createLink.isPending ? "Creando..." : "Guardar link"}
                    </Button>
                  </form>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Links</p>
                    <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                      {links.map((link) => {
                        const a = wardrobe.find((p) => p.id === link.prendaAId);
                        const b = wardrobe.find((p) => p.id === link.prendaBId);
                        return (
                          <div
                            key={link.id}
                            className="flex items-center justify-between rounded-lg border border-white/5 bg-secondary/30 px-3 py-2"
                          >
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <LinkIcon className="h-4 w-4 text-primary" />
                                <span className="text-sm font-medium">
                                  {a?.name ?? "A"} - {b?.name ?? "B"}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                <Badge variant="muted">{link.strength}</Badge>
                                {link.contextTags.map((tag) => (
                                  <Badge key={tag} variant="outline">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground hover:text-destructive"
                              onClick={() => removeLink.mutate(link.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="outfits">
            <div className="grid gap-6 lg:grid-cols-[380px,1fr]">
              <Card>
                <CardHeader>
                  <CardTitle>Generar outfits</CardTitle>
                  <CardDescription>Aplica clique completa y rango de formalidad.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <form
                    className="space-y-3"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const form = new FormData(e.currentTarget as HTMLFormElement);
                      const occasion = String(form.get("occasion") ?? "");
                      const formalidad = form.get("formalidad")
                        ? Number(form.get("formalidad"))
                        : null;
                      generateOutfits.mutate({
                        occasion,
                        formalidadObjetivo: formalidad || null,
                        requiredPrendaIds: Array.from(requiredPrendas),
                      });
                    }}
                  >
                    <div className="space-y-1.5">
                      <Label>Ocasion</Label>
                      <Input name="occasion" placeholder="Cena, trabajo..." required />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Formalidad objetivo</Label>
                      <Input name="formalidad" type="number" min={1} max={5} placeholder="1-5" />
                    </div>
                    <div className="space-y-2">
                      <Label>Prendas obligatorias</Label>
                      <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                        {wardrobe.map((p) => (
                          <label
                            key={p.id}
                            className="flex items-center gap-2 rounded-md border border-white/5 bg-secondary/30 px-2 py-1.5 text-xs"
                          >
                            <Checkbox
                              checked={requiredPrendas.has(p.id)}
                              onCheckedChange={(checked) => {
                                setRequiredPrendas((prev) => {
                                  const next = new Set(prev);
                                  checked ? next.add(p.id) : next.delete(p.id);
                                  return next;
                                });
                              }}
                            />
                            <span>{p.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <Button className="w-full" type="submit" disabled={generateOutfits.isPending}>
                      {generateOutfits.isPending ? "Generando..." : "Generar"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Propuestas</p>
                    <h3 className="text-lg font-semibold">Outfits generados</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      generateOutfits.mutate({
                        occasion: "dia casual",
                        formalidadObjetivo: null,
                        requiredPrendaIds: [],
                      })
                    }
                  >
                    <RefreshCw className="mr-2 h-4 w-4" /> Quick try
                  </Button>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  {generated.map((outfit, idx) => {
                    const prendas = outfit.prendasIds
                      .map((id) => wardrobe.find((p) => p.id === id))
                      .filter(Boolean) as Prenda[];
                    return (
                      <Card key={outfit.prendasIds.join("-") + idx} className="border-primary/20">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">Propuesta #{idx + 1}</CardTitle>
                            <Badge variant="muted">score {outfit.score?.toFixed(2) ?? "ok"}</Badge>
                          </div>
                          <CardDescription>{outfit.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex flex-wrap gap-2 text-xs">
                            {prendas.map((p) => (
                              <Badge key={p.id} variant="outline">
                                {p.name} - {p.category}
                              </Badge>
                            ))}
                          </div>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() =>
                              saveOutfit.mutate({
                                prendasIds: outfit.prendasIds,
                                occasion: outfit.description.slice(0, 40) || "Outfit generado",
                                description: outfit.description,
                              })
                            }
                          >
                            Guardar outfit
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                  {generated.length === 0 && (
                    <Card className="border-dashed text-muted-foreground">
                      <CardContent className="flex flex-col items-start gap-2 p-6">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <p className="text-sm">Genera un outfit para ver propuestas basadas en tu grafo.</p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4 text-primary" />
                    <h4 className="text-sm font-semibold">Outfits guardados</h4>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    {outfitsQuery.data?.map((outfit) => (
                      <Card key={outfit.id} className="border-white/5 bg-secondary/20">
                        <CardHeader>
                          <CardTitle className="text-base">{outfit.occasion}</CardTitle>
                          <CardDescription>{outfit.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2 text-xs">
                            {outfit.prendasIds.map((id) => {
                              const prenda = wardrobe.find((p) => p.id === id);
                              return (
                                <Badge key={id} variant="outline">
                                  {prenda?.name ?? id}
                                </Badge>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

function PrendaCard({
  prenda,
  onDelete,
  onUpdate,
}: {
  prenda: Prenda;
  onDelete: () => void;
  onUpdate: (values: PrendaFormValues) => void;
}) {
  const [open, setOpen] = useState(false);
  const editForm = useForm<PrendaFormValues>({
    defaultValues: {
      name: prenda.name,
      category: prenda.category,
      mainColor: prenda.mainColor,
      secondaryColors: prenda.secondaryColors.join(", "),
      formality: prenda.formality,
      styleTags: prenda.styleTags.join(", "),
      fit: prenda.fit ?? "",
      warmth: prenda.warmth,
      pattern: prenda.pattern,
      fabric: prenda.fabric,
      seasonTags: prenda.seasonTags.join(", "),
      notes: prenda.notes ?? "",
      imageUrl: prenda.imageUrl ?? "",
    },
  });

  return (
    <Card className="border-white/5 bg-secondary/20">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{prenda.category}</p>
            <h3 className="text-lg font-semibold">{prenda.name}</h3>
            <p className="text-xs text-muted-foreground">
              Formalidad {prenda.formality} | Abrigo {prenda.warmth} | {prenda.fabric}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="secondary">
                  Editar
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Editar prenda</DialogTitle>
                </DialogHeader>
                <form
                  className="space-y-3"
                  onSubmit={editForm.handleSubmit((values) => {
                    onUpdate(values);
                    setOpen(false);
                  })}
                >
                  <div className="space-y-1.5">
                    <Label>Nombre</Label>
                    <Input {...editForm.register("name")} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Style tags</Label>
                    <Input {...editForm.register("styleTags")} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Formalidad</Label>
                      <Input type="number" min={1} max={5} {...editForm.register("formality", { valueAsNumber: true })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Abrigo</Label>
                      <Input type="number" min={1} max={5} {...editForm.register("warmth", { valueAsNumber: true })} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Notas</Label>
                    <Textarea rows={2} {...editForm.register("notes")} />
                  </div>
                  <Button type="submit" className="w-full">
                    Guardar cambios
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
            <Button
              size="icon"
              variant="ghost"
              className="text-muted-foreground hover:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <Badge variant="outline">Color {prenda.mainColor}</Badge>
          {prenda.secondaryColors.map((c) => (
            <Badge variant="outline" key={c}>
              {c}
            </Badge>
          ))}
          {prenda.styleTags.map((tag) => (
            <Badge key={tag} variant="muted">
              {tag}
            </Badge>
          ))}
        </div>
        {prenda.seasonTags.length > 0 && (
          <div className="flex flex-wrap gap-1 text-[11px] text-muted-foreground">
            {prenda.seasonTags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        {prenda.notes && <p className="text-xs text-muted-foreground">{prenda.notes}</p>}
      </CardContent>
    </Card>
  );
}
