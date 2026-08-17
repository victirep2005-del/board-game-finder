import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  roomFormSchema,
  shelfFormSchema,
  type RoomFormData,
  type ShelfFormData,
  type Room,
} from "@/lib/schemas";

interface RoomFormProps {
  initialData?: Room;
  onSubmit: (data: RoomFormData) => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

export function RoomForm({
  initialData,
  onSubmit,
  isSubmitting,
  submitLabel = "Guardar cuarto",
}: RoomFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RoomFormData>({
    resolver: zodResolver(roomFormSchema),
    defaultValues: { name: initialData?.name ?? "" },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="roomName">Nombre del cuarto</Label>
        <Input
          id="roomName"
          placeholder="Ej: Sala Principal"
          {...register("name")}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Guardando..." : submitLabel}
      </Button>
    </form>
  );
}

interface ShelfFormProps {
  rooms: Room[];
  initialData?: { id: string; name: string; roomId: string };
  onSubmit: (data: ShelfFormData) => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

export function ShelfForm({
  rooms,
  initialData,
  onSubmit,
  isSubmitting,
  submitLabel = "Guardar estante",
}: ShelfFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ShelfFormData>({
    resolver: zodResolver(shelfFormSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      roomId: initialData?.roomId ?? "",
    },
  });

  const roomId = watch("roomId");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="shelfName">Nombre del estante</Label>
        <Input
          id="shelfName"
          placeholder="Ej: A1"
          {...register("name")}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="shelfRoomId">Cuarto</Label>
        <Select
          value={roomId}
          onValueChange={(value) => setValue("roomId", value, { shouldValidate: true })}
        >
          <SelectTrigger id="shelfRoomId">
            <SelectValue placeholder="Selecciona un cuarto" />
          </SelectTrigger>
          <SelectContent>
            {rooms.map((room) => (
              <SelectItem key={room.id} value={room.id}>
                {room.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.roomId && (
          <p className="text-sm text-destructive">{errors.roomId.message}</p>
        )}
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Guardando..." : submitLabel}
      </Button>
    </form>
  );
}
