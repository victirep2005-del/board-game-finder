import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  boardGameFormSchema,
  type BoardGameFormData,
  type BoardGameWithLocation,
  type ShelfWithRoom,
  difficultyLabels,
  type Difficulty,
} from "@/lib/schemas";

interface GameFormProps {
  initialData?: BoardGameWithLocation;
  shelves: ShelfWithRoom[];
  onSubmit: (data: BoardGameFormData) => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

export function GameForm({
  initialData,
  shelves,
  onSubmit,
  isSubmitting,
  submitLabel = "Guardar",
}: GameFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BoardGameFormData>({
    resolver: zodResolver(boardGameFormSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          shelfId: initialData.shelfId,
          minPlayers: initialData.minPlayers,
          maxPlayers: initialData.maxPlayers,
          durationMinutes: initialData.durationMinutes,
          minAge: initialData.minAge,
          difficulty: initialData.difficulty,
          notes: initialData.notes ?? "",
        }
      : {
          name: "",
          shelfId: "",
          minPlayers: null,
          maxPlayers: null,
          durationMinutes: null,
          minAge: null,
          difficulty: "casual",
          notes: "",
        },
  });

  const selectedShelfId = watch("shelfId");
  const difficulty = watch("difficulty");

  const shelvesByRoom = shelves.reduce((acc, shelf) => {
    const roomName = shelf.room?.name ?? "Sin cuarto";
    if (!acc[roomName]) acc[roomName] = [];
    acc[roomName].push(shelf);
    return acc;
  }, {} as Record<string, ShelfWithRoom[]>);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="name">Nombre del juego</Label>
        <Input
          id="name"
          placeholder="Ej: Catan"
          {...register("name")}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="shelfId">Ubicación</Label>
        <Select
          value={selectedShelfId}
          onValueChange={(value) => setValue("shelfId", value, { shouldValidate: true })}
        >
          <SelectTrigger id="shelfId">
            <SelectValue placeholder="Selecciona un estante" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(shelvesByRoom).map(([roomName, roomShelves]) => (
              <SelectGroup key={roomName}>
                <SelectLabel>{roomName}</SelectLabel>
                {roomShelves.map((shelf) => (
                  <SelectItem key={shelf.id} value={shelf.id}>
                    {shelf.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
        {errors.shelfId && (
          <p className="text-sm text-destructive">{errors.shelfId.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="minPlayers">Jugadores mín.</Label>
          <Input
            id="minPlayers"
            type="number"
            min={1}
            {...register("minPlayers", { valueAsNumber: true })}
          />
          {errors.minPlayers && (
            <p className="text-sm text-destructive">{errors.minPlayers.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxPlayers">Jugadores máx.</Label>
          <Input
            id="maxPlayers"
            type="number"
            min={1}
            {...register("maxPlayers", { valueAsNumber: true })}
          />
          {errors.maxPlayers && (
            <p className="text-sm text-destructive">{errors.maxPlayers.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="durationMinutes">Duración (min)</Label>
          <Input
            id="durationMinutes"
            type="number"
            min={1}
            {...register("durationMinutes", { valueAsNumber: true })}
          />
          {errors.durationMinutes && (
            <p className="text-sm text-destructive">{errors.durationMinutes.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="minAge">Edad mínima</Label>
          <Input
            id="minAge"
            type="number"
            min={1}
            {...register("minAge", { valueAsNumber: true })}
          />
          {errors.minAge && (
            <p className="text-sm text-destructive">{errors.minAge.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="difficulty">Dificultad</Label>
        <Select
          value={difficulty}
          onValueChange={(value) =>
            setValue("difficulty", value as Difficulty, { shouldValidate: true })
          }
        >
          <SelectTrigger id="difficulty">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(["casual", "medium", "hard", "expert"] as Difficulty[]).map((d) => (
              <SelectItem key={d} value={d}>
                {difficultyLabels[d]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notas</Label>
        <Textarea
          id="notes"
          placeholder="Información adicional opcional..."
          rows={3}
          {...register("notes")}
        />
        {errors.notes && (
          <p className="text-sm text-destructive">{errors.notes.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Guardando..." : submitLabel}
      </Button>
    </form>
  );
}
