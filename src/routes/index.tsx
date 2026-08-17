import { createFileRoute } from "@tanstack/react-router";
import {
  queryOptions,
  useQuery,
  keepPreviousData,
} from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { GameCard } from "@/components/game-card";
import { searchGames } from "@/lib/games.functions";

const allGamesQueryOptions = queryOptions({
  queryKey: ["games", "all"],
  queryFn: () => searchGames({ data: { query: "" } }),
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TerraLudo" },
      {
        name: "description",
        content:
          "Busca un juego de mesa y descubre en qué cuarto y estante está.",
      },
      {
        property: "og:title",
        content: "BoardGameFinder — Buscar juego",
      },
      {
        property: "og:description",
        content:
          "Busca un juego de mesa y descubre en qué cuarto y estante está.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),

  loader: ({ context }) =>
    context.queryClient.ensureQueryData(allGamesQueryOptions),

  component: HomePage,

  errorComponent: ({ error }) => (
    <div role="alert" className="p-4 text-red-200">
      Error al cargar juegos: {error.message}
    </div>
  ),

  notFoundComponent: () => (
    <div className="p-4 text-center text-white">
      No se encontraron juegos.
    </div>
  ),
});

function HomePage() {
  const [query, setQuery] = useState("");

  const { data: allGames = [] } = useQuery({
    ...allGamesQueryOptions,
    placeholderData: keepPreviousData,
  });

  const normalizedQuery = query.trim().toLocaleLowerCase();
  const games = useMemo(() => {
    if (!normalizedQuery) return allGames;

    return allGames.filter((game) =>
      game.name.toLocaleLowerCase().includes(normalizedQuery),
    );
  }, [allGames, normalizedQuery]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-lg sm:text-4xl">
          Buscar Juego
        </h1>

        <p className="mt-2 text-base font-medium text-white/85 drop-shadow-md">
          TerraLudo
        </p>
      </div>

      <div className="relative mt-8">
        <Search className="absolute left-3 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-white/75" />

        <Input
          type="search"
          placeholder="Buscar juego de mesa..."
          className="h-12 border-white/40 bg-black/35 pl-10 text-base text-white shadow-lg backdrop-blur-sm placeholder:text-white/60 focus:border-white/70 focus:ring-white/30"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </div>

      <div className="mt-6 space-y-3">
        {games.length === 0 ? (
          <div className="rounded-lg border border-white/30 bg-black/30 p-8 text-center backdrop-blur-sm">
            <p className="text-white/80">
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
