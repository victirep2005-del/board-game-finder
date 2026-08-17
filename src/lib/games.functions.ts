import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import {
  boardGameFormSchema,
  type BoardGameFormData,
  type BoardGameWithLocation,
} from "@/lib/schemas";

function getSupabase() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

const gameWithLocationQuery = `
  id,
  name,
  shelf_id,
  min_players,
  max_players,
  duration_minutes,
  min_age,
  difficulty,
  notes,
  shelves:shelf_id (
    id,
    name,
    rooms:room_id (
      id,
      name
    )
  )
`;

function mapGameRow(row: any): BoardGameWithLocation {
  const shelf = Array.isArray(row.shelves) ? row.shelves[0] : row.shelves;
  return {
    id: row.id,
    name: row.name,
    shelfId: row.shelf_id,
    minPlayers: row.min_players,
    maxPlayers: row.max_players,
    durationMinutes: row.duration_minutes,
    minAge: row.min_age,
    difficulty: row.difficulty,
    notes: row.notes,
    shelf: shelf
      ? {
          id: shelf.id,
          name: shelf.name,
          room: shelf.rooms
            ? Array.isArray(shelf.rooms)
              ? shelf.rooms[0]
              : shelf.rooms
            : null,
        }
      : null,
  };
}

export const searchGames = createServerFn({ method: "GET" })
  .inputValidator((input: { query: string }) => input)
  .handler(async ({ data }) => {
    const supabase = getSupabase();
    const q = data.query.trim();

    let dbQuery = supabase
      .from("board_games")
      .select(gameWithLocationQuery)
      .order("name", { ascending: true });

    if (q.length > 0) {
      dbQuery = dbQuery.ilike("name", `%${q}%`);
    }

    const { data: rows, error } = await dbQuery;
    if (error) throw error;

    return (rows || []).map(mapGameRow);
  });

export const getGameById = createServerFn({ method: "GET" })
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    const supabase = getSupabase();
    const { data: rows, error } = await supabase
      .from("board_games")
      .select(gameWithLocationQuery)
      .eq("id", data.id)
      .limit(1);

    if (error) throw error;
    if (!rows || rows.length === 0) return null;
    return mapGameRow(rows[0]);
  });

export const createGame = createServerFn({ method: "POST" })
  .inputValidator((input: BoardGameFormData) => boardGameFormSchema.parse(input))
  .handler(async ({ data }) => {
    const supabase = getSupabase();
    const { data: row, error } = await supabase
      .from("board_games")
      .insert({
        name: data.name,
        shelf_id: data.shelfId,
        min_players: data.minPlayers ?? null,
        max_players: data.maxPlayers ?? null,
        duration_minutes: data.durationMinutes ?? null,
        min_age: data.minAge ?? null,
        difficulty: data.difficulty,
        notes: data.notes ?? null,
      })
      .select(gameWithLocationQuery)
      .single();

    if (error) throw error;
    return mapGameRow(row);
  });

export const updateGame = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string; data: BoardGameFormData }) => {
    return {
      id: input.id,
      data: boardGameFormSchema.parse(input.data),
    };
  })
  .handler(async ({ data }) => {
    const supabase = getSupabase();
    const { data: row, error } = await supabase
      .from("board_games")
      .update({
        name: data.data.name,
        shelf_id: data.data.shelfId,
        min_players: data.data.minPlayers ?? null,
        max_players: data.data.maxPlayers ?? null,
        duration_minutes: data.data.durationMinutes ?? null,
        min_age: data.data.minAge ?? null,
        difficulty: data.data.difficulty,
        notes: data.data.notes ?? null,
      })
      .eq("id", data.id)
      .select(gameWithLocationQuery)
      .single();

    if (error) throw error;
    return mapGameRow(row);
  });

export const deleteGame = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    const supabase = getSupabase();
    const { error } = await supabase.from("board_games").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });
