import { createFileRoute, Link, useNavigate, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GameForm } from "@/components/game-form";
import { getGameById, updateGame } from "@/lib/games.functions";
import { listShelves } from "@/lib/locations.functions";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import type { BoardGameFormData } from "@/lib/schemas";

const gameQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["games", id],
    queryFn: () => getGameById({ data: { id } }),
  });

const shelvesQueryOptions = queryOptions({
  queryKey: ["shelves"],
  queryFn: () => listShelves(),
});

export const Route = createFileRoute("/catalogo/$id/editar")({
  head: () => ({
    meta: [
      { title: "Editar juego — BoardGameFinder" },
      { name: "description", content: "Edita los datos de un juego." },
      { property: "og:title", content: "Editar juego — BoardGameFinder" },
      { property: "og:description", content: "Edita los datos de un juego." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(shelvesQueryOptions);
    await context.queryClient.ensureQueryData(gameQueryOptions(params.id));
  },
  component: EditGamePage,
  errorComponent: ({ error }) => (
    <div role="alert" className="p-4 text-destructive">
      Error: {error.message}
    </div>
  ),
  notFoundComponent: () => <div>Juego no encontrado.</div>,
});

function EditGamePage() {
  const { id } = Route.useParams();
  const { data: game } = useSuspenseQuery(gameQueryOptions(id));
  const { data: shelves } = useSuspenseQuery(shelvesQueryOptions);
  const updateFn = useServerFn(updateGame);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  if (!game) throw notFound();

  const handleSubmit = async (data: BoardGameFormData) => {
    try {
      await updateFn({ data: { id, data } });
      toast.success("Juego actualizado");
      queryClient.invalidateQueries({ queryKey: ["games"] });
      navigate({ to: "/catalogo" });
    } catch (error) {
      toast.error("No se pudo actualizar el juego");
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Button variant="ghost" asChild className="mb-4 -ml-3">
        <Link to="/catalogo">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Volver al catálogo
        </Link>
      </Button>
      <h1 className="text-2xl font-bold tracking-tight">Editar juego</h1>
      <p className="text-muted-foreground">Modifica los datos de {game.name}.</p>
      <div className="mt-6 rounded-lg border bg-card p-6 shadow-sm">
        <GameForm
          initialData={game}
          shelves={shelves}
          onSubmit={handleSubmit}
          submitLabel="Guardar cambios"
        />
      </div>
    </div>
  );
}
