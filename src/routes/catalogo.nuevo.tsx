import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GameForm } from "@/components/game-form";
import { createGame } from "@/lib/games.functions";
import { listShelves } from "@/lib/locations.functions";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import type { BoardGameFormData } from "@/lib/schemas";

const shelvesQueryOptions = queryOptions({
  queryKey: ["shelves"],
  queryFn: () => listShelves(),
});

export const Route = createFileRoute("/catalogo/nuevo")({
  head: () => ({
    meta: [
      { title: "Añadir juego — BoardGameFinder" },
      { name: "description", content: "Añade un nuevo juego al catálogo." },
      { property: "og:title", content: "Añadir juego — BoardGameFinder" },
      { property: "og:description", content: "Añade un nuevo juego al catálogo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(shelvesQueryOptions),
  component: NewGamePage,
  errorComponent: ({ error }) => (
    <div role="alert" className="p-4 text-destructive">
      Error: {error.message}
    </div>
  ),
  notFoundComponent: () => <div>No encontrado.</div>,
});

function NewGamePage() {
  const { data: shelves } = useSuspenseQuery(shelvesQueryOptions);
  const createFn = useServerFn(createGame);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleSubmit = async (data: BoardGameFormData) => {
    try {
      await createFn({ data });
      toast.success("Juego añadido");
      queryClient.invalidateQueries({ queryKey: ["games"] });
      navigate({ to: "/catalogo" });
    } catch (error) {
      toast.error("No se pudo añadir el juego");
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
      <h1 className="text-2xl font-bold tracking-tight">Añadir juego</h1>
      <p className="text-muted-foreground">Completa los datos del nuevo juego.</p>
      <div className="mt-6 rounded-lg border bg-card p-6 shadow-sm">
        <GameForm shelves={shelves} onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
