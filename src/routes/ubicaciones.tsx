import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Pencil, Trash2, DoorOpen, Rows3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { RoomForm, ShelfForm } from "@/components/location-form";
import { listRooms, listShelves, createRoom, updateRoom, deleteRoom, createShelf, updateShelf, deleteShelf } from "@/lib/locations.functions";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import type { RoomFormData, ShelfFormData } from "@/lib/schemas";

const locationsQueryOptions = queryOptions({
  queryKey: ["locations"],
  queryFn: async () => {
    const [rooms, shelves] = await Promise.all([listRooms(), listShelves()]);
    return { rooms, shelves };
  },
});

export const Route = createFileRoute("/ubicaciones")({
  head: () => ({
    meta: [
      { title: "Ubicaciones — BoardGameFinder" },
      { name: "description", content: "Gestiona los cuartos y estantes del local." },
      { property: "og:title", content: "Ubicaciones — BoardGameFinder" },
      { property: "og:description", content: "Gestiona los cuartos y estantes del local." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(locationsQueryOptions),
  component: LocationsPage,
  errorComponent: ({ error }) => (
    <div role="alert" className="p-4 text-destructive">
      Error: {error.message}
    </div>
  ),
  notFoundComponent: () => <div>No encontrado.</div>,
});

function LocationsPage() {
  const { data: locations } = useSuspenseQuery(locationsQueryOptions);
  const queryClient = useQueryClient();

  const createRoomFn = useServerFn(createRoom);
  const updateRoomFn = useServerFn(updateRoom);
  const deleteRoomFn = useServerFn(deleteRoom);
  const createShelfFn = useServerFn(createShelf);
  const updateShelfFn = useServerFn(updateShelf);
  const deleteShelfFn = useServerFn(deleteShelf);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["locations", "shelves", "games"] });

  const handleCreateRoom = async (data: RoomFormData) => {
    try {
      await createRoomFn({ data });
      toast.success("Cuarto añadido");
      invalidate();
    } catch (error) {
      toast.error("No se pudo añadir el cuarto");
    }
  };

  const handleUpdateRoom = async (id: string, data: RoomFormData) => {
    try {
      await updateRoomFn({ data: { id, data } });
      toast.success("Cuarto actualizado");
      invalidate();
    } catch (error) {
      toast.error("No se pudo actualizar el cuarto");
    }
  };

  const handleDeleteRoom = async (id: string) => {
    try {
      await deleteRoomFn({ data: { id } });
      toast.success("Cuarto eliminado");
      invalidate();
    } catch (error) {
      toast.error("No se pudo eliminar el cuarto. Asegúrate de que no tenga estantes.");
    }
  };

  const handleCreateShelf = async (data: ShelfFormData) => {
    try {
      await createShelfFn({ data });
      toast.success("Estante añadido");
      invalidate();
    } catch (error) {
      toast.error("No se pudo añadir el estante");
    }
  };

  const handleUpdateShelf = async (id: string, data: ShelfFormData) => {
    try {
      await updateShelfFn({ data: { id, data } });
      toast.success("Estante actualizado");
      invalidate();
    } catch (error) {
      toast.error("No se pudo actualizar el estante");
    }
  };

  const handleDeleteShelf = async (id: string) => {
    try {
      await deleteShelfFn({ data: { id } });
      toast.success("Estante eliminado");
      invalidate();
    } catch (error) {
      toast.error("No se pudo eliminar el estante. Asegúrate de que no tenga juegos.");
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ubicaciones</h1>
          <p className="text-sm text-muted-foreground">
            Cuartos y estantes donde se guardan los juegos.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/catalogo/nuevo">Añadir juego</Link>
        </Button>
      </div>

      <div className="mt-6 space-y-6">
        <LocationSection
          title="Cuartos"
          icon={<DoorOpen className="h-5 w-5" />}
          count={locations.rooms.length}
          createDialog={
            <LocationDialog title="Nuevo cuarto" triggerLabel="Añadir cuarto">
              <RoomForm onSubmit={handleCreateRoom} />
            </LocationDialog>
          }
        >
          {locations.rooms.map((room) => {
            const roomShelves = locations.shelves.filter((s) => s.roomId === room.id);
            return (
              <div key={room.id} className="rounded-lg border p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <DoorOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{room.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <LocationDialog title="Editar cuarto" triggerLabel="Editar" icon={<Pencil className="h-4 w-4" />}>
                      <RoomForm initialData={room} onSubmit={(data) => handleUpdateRoom(room.id, data)} submitLabel="Guardar cambios" />
                    </LocationDialog>
                    <DeleteButton onConfirm={() => handleDeleteRoom(room.id)} />
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  {roomShelves.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Sin estantes.</p>
                  ) : (
                    roomShelves.map((shelf) => (
                      <div key={shelf.id} className="flex items-center justify-between gap-2 rounded-md bg-muted px-3 py-2">
                        <div className="flex items-center gap-2">
                          <Rows3 className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{shelf.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <LocationDialog title="Editar estante" triggerLabel="Editar" icon={<Pencil className="h-4 w-4" />}>
                            <ShelfForm rooms={locations.rooms} initialData={{ id: shelf.id, name: shelf.name, roomId: shelf.roomId }} onSubmit={(data) => handleUpdateShelf(shelf.id, data)} submitLabel="Guardar cambios" />
                          </LocationDialog>
                          <DeleteButton onConfirm={() => handleDeleteShelf(shelf.id)} />
                        </div>
                      </div>
                    ))
                  )}
                  <LocationDialog title={`Nuevo estante en ${room.name}`} triggerLabel="Añadir estante" variant="ghost" size="sm">
                    <ShelfForm rooms={locations.rooms} initialData={{ id: "", name: "", roomId: room.id }} onSubmit={handleCreateShelf} submitLabel="Añadir estante" />
                  </LocationDialog>
                </div>
              </div>
            );
          })}
        </LocationSection>
      </div>
    </div>
  );
}

function LocationSection({
  title,
  icon,
  count,
  createDialog,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  count: number;
  createDialog: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="font-semibold">{title}</h2>
          <span className="text-sm text-muted-foreground">({count})</span>
        </div>
        {createDialog}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function LocationDialog({
  title,
  triggerLabel,
  icon,
  children,
  variant,
  size,
}: {
  title: string;
  triggerLabel: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "icon";
}) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant ?? (size === "icon" ? "ghost" : "outline")} size={size ?? (icon ? "icon" : "default")}>
          {icon ?? <Plus className="mr-1 h-4 w-4" />}
          {icon ? null : triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div onSubmit={() => setOpen(false)}>
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DeleteButton({ onConfirm }: { onConfirm: () => void }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Eliminar</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Si tiene elementos vinculados, la eliminación fallará.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
