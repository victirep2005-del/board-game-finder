import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { listShelves } from "@/lib/locations.functions";
import { importLegacyCollection, previewLegacyCollection, type LegacyGame } from "@/lib/games.functions";
import type { ShelfWithRoom } from "@/lib/schemas";

export const Route = createFileRoute("/import-collection")({ component: ImportCollectionPage });

function ImportCollectionPage() {
  const [shelves, setShelves] = useState<ShelfWithRoom[]>([]);
  const [selectedShelf, setSelectedShelf] = useState("");
  const [games, setGames] = useState<LegacyGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    void (async () => {
      try {
        const [shelfData, preview] = await Promise.all([listShelves(), previewLegacyCollection()]);
        setShelves(shelfData);
        setGames(preview.games);
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudo cargar la colección.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleImport = async () => {
    if (!selectedShelf || !games.length) return;
    setImporting(true); setError(""); setMessage("");
    try {
      const result = await importLegacyCollection({ data: { shelfId: selectedShelf, games } });
      setMessage(`Importación terminada: ${result.inserted} juegos añadidos y ${result.skipped} omitidos porque ya existían.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo completar la importación.");
    } finally { setImporting(false); }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-300">Herramienta de administración</p>
          <h1 className="mt-2 text-3xl font-bold">Importar colección antigua</h1>
          <p className="mt-2 max-w-3xl text-slate-300">Lee automáticamente la colección de Terra Ludo, convierte jugadores, duración, edad y categoría a los campos de tu base de datos y evita duplicados por nombre. Las imágenes se dejan vacías para añadirlas después desde el administrador.</p>
        </div>

        {loading ? <div className="rounded-xl border border-white/10 bg-white/5 p-6">Cargando colección y estantes...</div> : (
          <>
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">Estante donde colocar los juegos importados</label>
                <Select value={selectedShelf} onValueChange={setSelectedShelf}>
                  <SelectTrigger className="border-white/15 bg-slate-900 text-white"><SelectValue placeholder="Selecciona un estante" /></SelectTrigger>
                  <SelectContent className="border-white/15 bg-slate-900 text-white">
                    {shelves.map((shelf) => <SelectItem key={shelf.id} value={shelf.id}>{shelf.room?.name ? `${shelf.room.name} · ` : ""}{shelf.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <p className="mt-2 text-xs text-slate-400">Puedes mover los juegos a otros estantes después desde el administrador.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-blue-500/15 px-3 py-1 text-sm text-blue-200">{games.length} juegos detectados</span>
                <Button onClick={() => void handleImport()} disabled={!selectedShelf || !games.length || importing}>{importing ? "Importando..." : `Importar ${games.length} juegos`}</Button>
              </div>
            </div>

            {message && <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-emerald-200">{message}</div>}
            {error && <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-red-200">{error}</div>}

            <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
              <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-white/5 text-slate-300"><tr><th className="px-4 py-3">Juego</th><th className="px-4 py-3">Categoría</th><th className="px-4 py-3">Jugadores</th><th className="px-4 py-3">Duración</th><th className="px-4 py-3">Edad</th><th className="px-4 py-3">Dificultad</th></tr></thead><tbody>{games.map((game) => <tr key={game.name} className="border-t border-white/5"><td className="px-4 py-3 font-medium text-white">{game.name}</td><td className="px-4 py-3 text-slate-300">{game.category}</td><td className="px-4 py-3 text-slate-300">{game.minPlayers}-{game.maxPlayers}</td><td className="px-4 py-3 text-slate-300">{game.durationMinutes ? `${game.durationMinutes} min` : "—"}</td><td className="px-4 py-3 text-slate-300">{game.minAge ? `${game.minAge}+` : "—"}</td><td className="px-4 py-3 capitalize text-slate-300">{game.difficulty}</td></tr>)}</tbody></table></div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
