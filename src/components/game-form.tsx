import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { boardGameFormSchema, type BoardGameFormData, type BoardGameWithLocation, type ShelfWithRoom, difficultyLabels, type Difficulty } from "@/lib/schemas";
import { GameImageUpload } from "@/components/game-image-upload";

interface GameFormProps { initialData?: BoardGameWithLocation; shelves: ShelfWithRoom[]; onSubmit: (data: BoardGameFormData) => void; isSubmitting?: boolean; submitLabel?: string; }

export function GameForm({ initialData, shelves, onSubmit, isSubmitting, submitLabel = "Guardar" }: GameFormProps) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<BoardGameFormData>({
    resolver: zodResolver(boardGameFormSchema),
    defaultValues: initialData
      ? { name: initialData.name, shelfId: initialData.shelfId, minPlayers: initialData.minPlayers, maxPlayers: initialData.maxPlayers, durationMinutes: initialData.durationMinutes, minAge: initialData.minAge, difficulty: initialData.difficulty, notes: initialData.notes ?? "", imageUrl: initialData.imageUrl ?? null }
      : { name: "", shelfId: "", minPlayers: null, maxPlayers: null, durationMinutes: null, minAge: null, difficulty: "casual", notes: "", imageUrl: null },
  });
  const selectedShelfId = watch("shelfId"); const difficulty = watch("difficulty"); const imageUrl = watch("imageUrl");
  const shelvesByRoom = shelves.reduce((acc, shelf) => { const roomName = shelf.room?.name ?? "Sin cuarto"; if (!acc[roomName]) acc[roomName] = []; acc[roomName].push(shelf); return acc; }, {} as Record<string, ShelfWithRoom[]>);
  const inputClass = "bg-slate-950/45 border-white/20 text-foreground placeholder:text-slate-400 focus-visible:border-primary";
  const selectClass = "bg-slate-950/55 border-white/20 text-foreground";
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2"><Label htmlFor="name" className="text-foreground">Nombre del juego</Label><Input id="name" placeholder="Ej: Catan" className={inputClass} {...register("name")} />{errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}</div>
      <div className="space-y-2"><Label htmlFor="shelfId" className="text-foreground">Ubicación</Label><Select value={selectedShelfId} onValueChange={(value) => setValue("shelfId", value, { shouldValidate: true })}><SelectTrigger id="shelfId" className={selectClass}><SelectValue placeholder="Selecciona un estante" /></SelectTrigger><SelectContent className="border-white/20 bg-slate-900 text-foreground">{Object.entries(shelvesByRoom).map(([roomName, roomShelves]) => <SelectGroup key={roomName}><SelectLabel className="text-slate-300">{roomName}</SelectLabel>{roomShelves.map((shelf) => <SelectItem key={shelf.id} value={shelf.id}>{shelf.name}</SelectItem>)}</SelectGroup>)}</SelectContent></Select>{errors.shelfId && <p className="text-sm text-destructive">{errors.shelfId.message}</p>}</div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">{[["minPlayers", "Jugadores mín."], ["maxPlayers", "Jugadores máx."], ["durationMinutes", "Duración (min)"], ["minAge", "Edad mínima"]].map(([id, label]) => <div className="space-y-2" key={id}><Label htmlFor={id} className="text-foreground">{label}</Label><Input id={id} type="number" min={1} className={inputClass} {...register(id as keyof BoardGameFormData, { valueAsNumber: true })} />{errors[id as keyof BoardGameFormData] && <p className="text-sm text-destructive">{String(errors[id as keyof BoardGameFormData]?.message ?? "")}</p>}</div>)}</div>
      <div className="space-y-2"><Label htmlFor="difficulty" className="text-foreground">Dificultad</Label><Select value={difficulty} onValueChange={(value) => setValue("difficulty", value as Difficulty, { shouldValidate: true })}><SelectTrigger id="difficulty" className={selectClass}><SelectValue /></SelectTrigger><SelectContent className="border-white/20 bg-slate-900 text-foreground">{(["casual", "medium", "hard", "expert"] as Difficulty[]).map((d) => <SelectItem key={d} value={d}>{difficultyLabels[d]}</SelectItem>)}</SelectContent></Select></div>
      <div className="space-y-2"><Label htmlFor="notes" className="text-foreground">Notas</Label><Textarea id="notes" placeholder="Información adicional opcional..." rows={3} className={inputClass} {...register("notes")} />{errors.notes && <p className="text-sm text-destructive">{errors.notes.message}</p>}</div>
      <GameImageUpload gameId={initialData?.id} value={imageUrl} onChange={(url) => setValue("imageUrl", url, { shouldDirty: true })} />
      <Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting ? "Guardando..." : submitLabel}</Button>
    </form>
  );
}
