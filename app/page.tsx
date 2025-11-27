"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { 
  LayoutDashboard, 
  Shirt, 
  Network, 
  Sparkles, 
  LogOut, 
  Plus, 
  Search,
  Trash2
} from "lucide-react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { type Prenda, type Category, type Fit, type Pattern, type Link as LinkType, type Outfit } from "@/lib/types";
import { prendaSchema } from "@/lib/validators";
import { createClient } from "@/lib/supabase/client";
import { ColorSelector } from "@/components/wardrobe/color-selector";

// Carga dinámica del grafo para evitar errores de SSR
const GraphCanvas = dynamic(
  () => import("@/components/graph-canvas").then((mod) => mod.GraphCanvas),
  { ssr: false },
);

// --- API Helper ---
async function api<T>(url: string, options?: RequestInit) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error((errorBody as any)?.error || res.statusText);
  }
  return res.json() as Promise<T>;
}

function splitList(value: string) {
  if (!value) return [];
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

type ViewState = "dashboard" | "wardrobe" | "graph" | "outfits";

export default function DashboardPage() {
  const [view, setView] = useState<ViewState>("dashboard");
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const renderContent = () => {
    switch (view) {
      case "dashboard":
        return <DashboardHome setView={setView} />;
      case "wardrobe":
        return <WardrobeView />;
      case "graph":
        return <GraphView />;
      case "outfits":
        return <OutfitsView />;
      default:
        return <DashboardHome setView={setView} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50/50 font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3 font-bold text-xl tracking-tight text-slate-900">
            <div className="h-8 w-8 bg-black text-white rounded-lg flex items-center justify-center shadow-sm">
              <Sparkles className="h-4 w-4" />
            </div>
            MeshFit
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <NavButton active={view === "dashboard"} onClick={() => setView("dashboard")} icon={LayoutDashboard}>Dashboard</NavButton>
          <NavButton active={view === "wardrobe"} onClick={() => setView("wardrobe")} icon={Shirt}>Guardarropa</NavButton>
          <NavButton active={view === "graph"} onClick={() => setView("graph")} icon={Network}>Grafo</NavButton>
          <NavButton active={view === "outfits"} onClick={() => setView("outfits")} icon={Sparkles}>Outfits</NavButton>
        </nav>
        <div className="p-4 border-t border-slate-100">
          <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  );
}

function NavButton({ children, icon: Icon, active, onClick }: any) {
  return (
    <Button
      variant={active ? "secondary" : "ghost"}
      className={`w-full justify-start ${active ? "bg-slate-100 text-slate-900 font-medium" : "text-slate-500 hover:text-slate-900"}`}
      onClick={onClick}
    >
      <Icon className={`mr-3 h-4 w-4 ${active ? "text-slate-900" : "text-slate-400"}`} />
      {children}
    </Button>
  );
}

// --- Vistas ---

function DashboardHome({ setView }: { setView: (v: ViewState) => void }) {
  const { data: prendas } = useQuery<Prenda[]>({ queryKey: ["wardrobe"], queryFn: () => api("/api/wardrobe") });
  
  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Hola, Estilista</h1>
        <p className="text-slate-500 mt-2">Aquí tienes un resumen de tu armario digital.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Prendas" value={prendas?.length || 0} icon={Shirt} onClick={() => setView("wardrobe")} />
        <StatCard title="Links" value="-" icon={Network} onClick={() => setView("graph")} />
        <StatCard title="Outfits" value="-" icon={Sparkles} onClick={() => setView("outfits")} />
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, onClick }: any) {
  return (
    <Card className="hover:shadow-lg transition-all cursor-pointer border-slate-200 hover:border-slate-300" onClick={onClick}>
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-4xl font-bold mt-2 text-slate-900">{value}</h3>
        </div>
        <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
          <Icon className="h-6 w-6" />
        </div>
      </CardContent>
    </Card>
  );
}

function WardrobeView() {
  const qc = useQueryClient();
  const { data: prendas, isLoading } = useQuery<Prenda[]>({ queryKey: ["wardrobe"], queryFn: () => api("/api/wardrobe") });
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  const deletePrenda = useMutation({
    mutationFn: (id: string) => api(`/api/wardrobe/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wardrobe"] });
      toast({ title: "Prenda eliminada" });
    },
  });

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex items-end justify-between border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Tu Guardarropa</h2>
          <p className="text-slate-500 mt-1">Gestiona y organiza tus prendas.</p>
        </div>
        <Dialog open={isWizardOpen} onOpenChange={setIsWizardOpen}>
          <DialogTrigger asChild>
            <Button className="bg-black hover:bg-slate-800 text-white rounded-full px-6">
              <Plus className="mr-2 h-4 w-4" /> Agregar Prenda
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0 bg-white">
            <div className="p-6 border-b sticky top-0 bg-white z-10">
              <DialogHeader>
                <DialogTitle className="text-xl">Nueva Prenda</DialogTitle>
              </DialogHeader>
            </div>
            <div className="p-6">
              <PrendaWizard onClose={() => setIsWizardOpen(false)} />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-64 bg-slate-100 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {prendas?.map((prenda) => (
            <Card key={prenda.id} className="group relative overflow-hidden border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <CardContent className="p-0">
                <div className="h-32 bg-slate-50 flex items-center justify-center relative">
                   <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="icon" variant="secondary" className="h-8 w-8 bg-white shadow-sm hover:bg-red-50" onClick={() => deletePrenda.mutate(prenda.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                   </div>
                   {/* Placeholder icon based on category */}
                   <Shirt className="h-12 w-12 text-slate-200" />
                </div>
                <div className="p-5 space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <Badge variant="secondary" className="uppercase text-[10px] tracking-wider font-medium bg-slate-100 text-slate-600 hover:bg-slate-100">
                        {prenda.category}
                      </Badge>
                      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Lvl {prenda.formality}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg leading-tight truncate">{prenda.name}</h3>
                    <p className="text-sm text-slate-500 mt-1 truncate">{prenda.fabric || "Material N/A"} • {prenda.fit || "Regular"}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs pt-2 border-t border-slate-100 mt-2">
                    <div className="h-3 w-3 rounded-full border border-slate-200" style={{ backgroundColor: getCssColor(prenda.mainColor) }} />
                    <span className="text-slate-600 font-medium">{prenda.mainColor}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {prendas?.length === 0 && (
            <div className="col-span-full py-20 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Shirt className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <p className="text-lg font-medium text-slate-600">Tu armario está vacío</p>
              <p>Agrega tu primera prenda para comenzar.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PrendaWizard({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const form = useForm({
    defaultValues: {
      name: "",
      category: "top" as Category,
      mainColor: "",
      secondaryColors: "",
      formality: 3,
      styleTags: "",
      fit: "regular" as Fit,
      warmth: 3,
      pattern: "solid" as Pattern,
      fabric: "",
      seasonTags: "",
      notes: "",
    }
  });

  const mutation = useMutation({
    mutationFn: async (values: any) => {
      const payload = prendaSchema.parse({
        ...values,
        secondaryColors: splitList(values.secondaryColors),
        styleTags: splitList(values.styleTags),
        seasonTags: splitList(values.seasonTags),
        formality: Number(values.formality),
        warmth: Number(values.warmth),
      });
      return api("/api/wardrobe", { method: "POST", body: JSON.stringify(payload) });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wardrobe"] });
      toast({ title: "¡Prenda guardada!", description: "Se agregó correctamente a tu armario." });
      onClose();
    },
    onError: (err: any) => {
       try {
        const parsed = JSON.parse(err.message);
        if (parsed.fieldErrors) {
           Object.entries(parsed.fieldErrors).forEach(([field, messages]) => {
             toast({ title: `Error en ${field}`, description: String(messages) });
           });
           return;
        }
      } catch (e) {}
      toast({ title: "Error", description: err.message });
    }
  });

  return (
    <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-8">
      
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label className="text-base font-semibold">Nombre de la prenda</Label>
          <Input placeholder="Ej: Camisa Oxford Blanca" className="h-12 text-lg" {...form.register("name")} autoFocus />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="grid gap-2">
            <Label>Categoría</Label>
            <Select onValueChange={(v) => form.setValue("category", v as Category)} defaultValue={form.getValues("category")}>
              <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="top">Top (Superior)</SelectItem>
                <SelectItem value="bottom">Bottom (Inferior)</SelectItem>
                <SelectItem value="shoes">Calzado</SelectItem>
                <SelectItem value="outerwear">Abrigo</SelectItem>
                <SelectItem value="accessory">Accesorio</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Color Principal</Label>
            {/* New Color Selector Component usage */}
            <div className="h-11">
              <ColorSelector 
                value={form.watch("mainColor")} 
                onChange={(color) => form.setValue("mainColor", color)} 
              />
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl space-y-4 border border-slate-100">
          <div className="grid gap-2">
            <div className="flex justify-between">
              <Label>Nivel de Formalidad</Label>
              <span className="text-sm font-medium text-slate-600">{form.watch("formality")}/5</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs font-medium text-slate-400 uppercase">Casual</span>
              <input 
                type="range" 
                min="1" max="5" 
                className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-black"
                {...form.register("formality")} 
              />
              <span className="text-xs font-medium text-slate-400 uppercase">Formal</span>
            </div>
          </div>
          
          <div className="grid gap-2">
            <div className="flex justify-between">
              <Label>Nivel de Abrigo</Label>
              <span className="text-sm font-medium text-slate-600">{form.watch("warmth")}/5</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs font-medium text-slate-400 uppercase">Fresco</span>
              <input 
                type="range" 
                min="1" max="5" 
                className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-black"
                {...form.register("warmth")} 
              />
              <span className="text-xs font-medium text-slate-400 uppercase">Abrigado</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
           <div className="grid gap-2">
            <Label>Fit / Corte</Label>
            <Select onValueChange={(v) => form.setValue("fit", v as Fit)} defaultValue={form.getValues("fit") || "regular"}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="slim">Slim (Ajustado)</SelectItem>
                <SelectItem value="regular">Regular (Normal)</SelectItem>
                <SelectItem value="oversized">Oversized (Holgado)</SelectItem>
                <SelectItem value="wide">Wide (Ancho)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Material</Label>
            <Input placeholder="Algodón, Lino, Cuero..." {...form.register("fabric")} />
          </div>
        </div>
        
        <div className="grid gap-2">
           <Label>Notas opcionales</Label>
           <Textarea placeholder="Detalles extra, marca, talle..." className="resize-none" {...form.register("notes")} />
        </div>
      </div>

      <Button type="submit" className="w-full h-12 text-base bg-black hover:bg-slate-800 text-white rounded-xl shadow-lg shadow-slate-200" disabled={mutation.isPending}>
        {mutation.isPending ? "Guardando..." : "Guardar Prenda"}
      </Button>
    </form>
  );
}

function GraphView() {
  const { data: prendas } = useQuery<Prenda[]>({ queryKey: ["wardrobe"], queryFn: () => api("/api/wardrobe") });
  const { data: links } = useQuery<LinkType[]>({ queryKey: ["links"], queryFn: () => api("/api/graph") });

  const nodes = useMemo(() => prendas?.map(p => ({ id: p.id, name: p.name, category: p.category, formality: p.formality })) || [], [prendas]);
  const edges = useMemo(() => links?.map(l => ({ id: l.id, source: l.prendaAId, target: l.prendaBId, strength: l.strength })) || [], [links]);

  return (
    <div className="p-8 h-full flex flex-col">
      <h2 className="text-3xl font-bold text-slate-900 mb-6">Grafo de Estilo</h2>
      <div className="flex-1 border border-slate-200 rounded-2xl bg-white shadow-sm overflow-hidden relative">
        <GraphCanvas nodes={nodes} links={edges} onNodeSelect={() => {}} selectedIds={[]} />
        <div className="absolute top-4 right-4 bg-white/90 p-4 rounded-xl border backdrop-blur-sm text-sm text-slate-500 max-w-xs">
          <p>Conecta nodos para crear outfits compatibles. (WIP: Interacción mejorada pronto)</p>
        </div>
      </div>
    </div>
  );
}

function OutfitsView() {
  return (
    <div className="p-8 flex flex-col items-center justify-center h-full text-center space-y-4">
      <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
        <Sparkles className="h-10 w-10" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900">Generador de Outfits</h2>
      <p className="text-slate-500 max-w-md">
        Esta sección usará la IA para proponerte combinaciones basadas en tu grafo. 
        <br/>Próximamente en la v2.
      </p>
    </div>
  );
}

// Helper simple para mapear colores a CSS
function getCssColor(colorName: string) {
  const lower = colorName.toLowerCase();
  if (lower.includes("blanco")) return "#ffffff";
  if (lower.includes("negro")) return "#000000";
  if (lower.includes("azul")) return "#000080";
  if (lower.includes("rojo")) return "#ff0000";
  if (lower.includes("beige")) return "#f5f5dc";
  if (lower.includes("gris")) return "#808080";
  if (lower.includes("verde")) return "#008000";
  if (lower.includes("marrón")) return "#a52a2a";
  return "#e2e8f0"; // Default gris claro
}