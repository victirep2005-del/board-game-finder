import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { GameCard } from "@/components/game-card";
import { searchGames } from "@/lib/games.functions";

const searchGamesQueryOptions = (query: string) =>
  queryOptions({
    queryKey: ["games", "search", query],
    queryFn: () => searchGames({ data: { query } }),
  });

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BoardGameFinder — Buscar juego" },
      { name: "description", content: "Busca un juego de mesa y descubre en qué cuarto y estante está." },
      { property: "og:title", content: "BoardGameFinder — Buscar juego" },
      { property: "og:description", content: "Busca un juego de mesa y descubre en qué cuarto y estante está." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(searchGamesQueryOptions("")),
  component: HomePage,
  errorComponent: ({ error }) => (
    <div role="alert" className="p-4 text-destructive">
      Error al cargar juegos: {error.message}
    </div>
  ),
  notFoundComponent: () => <div>No se encontraron juegos.</div>,
});

function HomePage() {
  const [query, setQuery] = useState("");
  const { data: games } = useSuspenseQuery(searchGamesQueryOptions(query));

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          ¿Dónde está el juego?
        </h1>
        <p className="mt-2 text-muted-foreground">
          Escribe el nombre y te decimos cuarto y estante.
        </p>
      </div>

      <div className="relative mt-8">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar juego de mesa..."
          className="h-12 pl-10 text-base shadow-sm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </div>

      <div className="mt-6 space-y-3">
        {games.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="text-muted-foreground">
              No hay juegos que coincidan con "{query}".
            </p>
          </div>
        ) : (
          games.map((game) => <GameCard key={game.id} game={game} />)
        )}
      </div>
    </div>
  );
}
