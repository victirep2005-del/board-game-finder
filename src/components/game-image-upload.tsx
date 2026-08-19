import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

interface GameImageUploadProps {
  gameId?: string;
  value?: string | null;
  onChange: (url: string | null) => void;
}

export function GameImageUpload({ gameId, value, onChange }: GameImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = async (file: File | undefined) => {
    if (!file) return;
    if (!gameId) {
      setError("Guarda primero el juego y después añade la foto desde Editar.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Selecciona un archivo de imagen.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("La imagen debe pesar menos de 8 MB.");
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${gameId}.${extension}`;

      // Reemplaza la imagen existente cuando el juego ya tiene una foto.
      // Esto evita el error "The resource already exists" al editarla.
      const { error: uploadError } = await supabase.storage
        .from("board-game-images")
        .upload(path, file, {
          upsert: true,
          contentType: file.type,
          cacheControl: "3600",
        });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("board-game-images").getPublicUrl(path);
      const url = `${data.publicUrl}?v=${Date.now()}`;
      onChange(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo subir la imagen.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="game-image" className="text-foreground">Foto del juego</Label>
        <Input id="game-image" type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="bg-slate-950/45 border-white/20 text-foreground" onChange={(e) => void handleChange(e.target.files?.[0])} disabled={uploading || !gameId} />
        <p className="text-xs text-slate-400">JPG, PNG, WEBP o GIF · máximo 8 MB.</p>
        {!gameId && <p className="text-xs text-amber-300">Guarda el juego primero para poder asociar una imagen.</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
      {value && <div className="overflow-hidden rounded-lg border border-white/15 bg-slate-900/50"><img src={value} alt="Vista previa del juego" className="h-56 w-full object-contain" /></div>}
    </div>
  );
}
