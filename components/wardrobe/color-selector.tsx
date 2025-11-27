"use client";

import { useState } from "react";
import { Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const COLOR_PALETTE = {
  Neutros: [
    { name: "Blanco", hex: "#FFFFFF", border: true },
    { name: "Negro", hex: "#000000" },
    { name: "Gris Claro", hex: "#D1D5DB" },
    { name: "Gris Oscuro", hex: "#4B5563" },
    { name: "Beige", hex: "#F5F5DC", border: true },
    { name: "Crema", hex: "#FFFDD0", border: true },
  ],
  Azul: [
    { name: "Azul Marino", hex: "#000080" },
    { name: "Azul Real", hex: "#4169E1" },
    { name: "Celeste", hex: "#87CEEB" },
    { name: "Denim", hex: "#1560BD" },
  ],
  Verde: [
    { name: "Verde Oliva", hex: "#808000" },
    { name: "Verde Bosque", hex: "#228B22" },
    { name: "Verde Militar", hex: "#4B5320" },
    { name: "Menta", hex: "#98FF98", border: true },
  ],
  Rojo: [
    { name: "Rojo Vivo", hex: "#FF0000" },
    { name: "Bordo", hex: "#800000" },
    { name: "Vino", hex: "#722F37" },
    { name: "Coral", hex: "#FF7F50" },
  ],
  Tierra: [
    { name: "Marrón", hex: "#964B00" },
    { name: "Camel", hex: "#C19A6B" },
    { name: "Terracota", hex: "#E2725B" },
    { name: "Mostaza", hex: "#FFDB58" },
  ],
  Otros: [
    { name: "Amarillo", hex: "#FFFF00", border: true },
    { name: "Naranja", hex: "#FFA500" },
    { name: "Rosa", hex: "#FFC0CB", border: true },
    { name: "Violeta", hex: "#8F00FF" },
  ],
};

type ColorSelectorProps = {
  value: string;
  onChange: (value: string) => void;
};

export function ColorSelector({ value, onChange }: ColorSelectorProps) {
  const [open, setOpen] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState<keyof typeof COLOR_PALETTE | null>(null);

  const selectedColorObj = Object.values(COLOR_PALETTE)
    .flat()
    .find((c) => c.name === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between px-3 font-normal"
        >
          {value ? (
            <div className="flex items-center gap-2">
              <div
                className={cn("h-4 w-4 rounded-full", selectedColorObj?.border && "border border-slate-200")}
                style={{ backgroundColor: selectedColorObj?.hex || "#ccc" }}
              />
              <span>{value}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">Seleccionar color...</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        {!selectedFamily ? (
          <div className="p-2 grid grid-cols-2 gap-2">
            {Object.keys(COLOR_PALETTE).map((family) => (
              <Button
                key={family}
                variant="ghost"
                className="justify-between text-left"
                onClick={() => setSelectedFamily(family as keyof typeof COLOR_PALETTE)}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full border border-slate-200"
                    style={{
                      backgroundColor: COLOR_PALETTE[family as keyof typeof COLOR_PALETTE][0].hex,
                    }}
                  />
                  {family}
                </div>
                <ChevronRight className="h-4 w-4 opacity-50" />
              </Button>
            ))}
          </div>
        ) : (
          <div className="p-2">
            <div className="flex items-center gap-2 pb-2 mb-2 border-b">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => setSelectedFamily(null)}
              >
                ← Volver
              </Button>
              <span className="text-sm font-medium ml-auto pr-2">{selectedFamily}</span>
            </div>
            <div className="grid grid-cols-1 gap-1">
              {COLOR_PALETTE[selectedFamily].map((color) => (
                <Button
                  key={color.name}
                  variant="ghost"
                  className="justify-start gap-3"
                  onClick={() => {
                    onChange(color.name);
                    setOpen(false);
                    setSelectedFamily(null);
                  }}
                >
                  <div
                    className={cn("h-4 w-4 rounded-full", color.border && "border border-slate-200")}
                    style={{ backgroundColor: color.hex }}
                  />
                  {color.name}
                  {value === color.name && <Check className="ml-auto h-4 w-4 opacity-50" />}
                </Button>
              ))}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
