
import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GameCard } from "@/components/game-card";
import { searchGames, deleteGame } from "@/lib/games.functions";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
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

const allGamesQueryOptions = queryOptions({
  queryKey: ["games", "all"],
  queryFn: () => searchGames({ data: { query: "" } }),
});

export const Route = createFileRoute("/catalogo/")({
  head: () => ({
    meta: [
      { title: "Catálogo — BoardGameFinder" },
      {
        name: "description",
        content: "Gestiona el catálogo de juegos de mesa.",
      },
      {
        property: "og:title",
        content: "Catálogo — BoardGameFinder",
      },
      {
        property: "og:description",
        content: "Gestiona el catálogo de juegos de mesa.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),

  loader: ({ context }) =>
    context.queryClient.ensureQueryData(allGamesQueryOptions),

  component: CatalogPage,

  errorComponent: ({ error }) => (
    <div
      role="alert"
      className="p-4 text-red-200"
    >
      Error al cargar el catálogo: {error.message}
    </div>
  ),

  notFoundComponent: () => (
    <div className="p-4 text-center text-white">
      No se encontraron juegos.
    </div>
  ),
});

function CatalogPage() {
  const { data: games } = useSuspenseQuery(allGamesQueryOptions);
  const queryClient = useQueryClient();
  const deleteFn = useServerFn(deleteGame);

  const handleDelete = async (id: string) => {
    try {
      await deleteFn({ data: { id } });

      toast.success("Juego eliminado");

      queryClient.invalidateQueries({
        queryKey: ["games"],
      });
    } catch (error) {
      toast.error("No se pudo eliminar el juego");
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Cabecera */}
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/15 bg-black/25 p-4 shadow-lg backdrop-blur-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Catálogo
          </h1>

          <p className="text-sm text-white/70">
            {games.length} juego{games.length !== 1 ? "s" : ""} en total
          </p>
        </div>

        <Button asChild>
          <Link to="/catalogo/nuevo">
            <Plus className="mr-1 h-4 w-4" />
            Añadir
          </Link>
        </Button>
      </div>

      {/* Juegos */}
      <div className="mt-6 space-y-3">
        {games.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/30 bg-black/30 p-8 text-center backdrop-blur-sm">
            <p className="text-white/80">
              No hay juegos aún.
            </p>

            <Button asChild className="mt-4">
              <Link to="/catalogo/nuevo">
                Añadir el primero
              </Link>
            </Button>
          </div>
        ) : (
          games.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              actions={
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                  >
                    <Link
                      to="/catalogo/$id/editar"
                      params={{ id: game.id }}
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">
                        Editar
                      </span>
                    </Link>
                  </Button>

                  <DeleteButton
                    onConfirm={() =>
                      handleDelete(game.id)
                    }
                  />
                </div>
              }
            />
          ))
        )}
      </div>
    </div>
  );
}

function DeleteButton({
  onConfirm,
}: {
  onConfirm: () => void;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-red-300 hover:text-red-200"
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">
            Eliminar
          </span>
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            ¿Eliminar este juego?
          </AlertDialogTitle>

          <AlertDialogDescription>
            Esta acción no se puede deshacer. El juego
            se borrará del catálogo.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>
            Cancelar
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
