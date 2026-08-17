import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import {
  roomFormSchema,
  shelfFormSchema,
  type Room,
  type RoomFormData,
  type Shelf,
  type ShelfFormData,
  type ShelfWithRoom,
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

function mapRoomRow(row: any): Room {
  return {
    id: row.id,
    name: row.name,
    sortOrder: row.sort_order,
  };
}

function mapShelfRow(row: any): Shelf {
  return {
    id: row.id,
    roomId: row.room_id,
    name: row.name,
    sortOrder: row.sort_order,
  };
}

export const listRooms = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = getSupabase();
  const { data: rows, error } = await supabase
    .from("rooms")
    .select("id, name, sort_order")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw error;
  return (rows || []).map(mapRoomRow);
});

export const listShelves = createServerFn({ method: "GET" }).handler(async (): Promise<ShelfWithRoom[]> => {
  const supabase = getSupabase();
  const { data: rows, error } = await supabase
    .from("shelves")
    .select("id, room_id, name, sort_order, rooms:room_id (id, name)")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw error;
  return (rows || []).map((row) => ({
    ...mapShelfRow(row),
    room: Array.isArray(row.rooms) ? row.rooms[0] : row.rooms,
  }));
});

export const createRoom = createServerFn({ method: "POST" })
  .inputValidator((input: RoomFormData) => roomFormSchema.parse(input))
  .handler(async ({ data }) => {
    const supabase = getSupabase();
    const { data: row, error } = await supabase
      .from("rooms")
      .insert({ name: data.name, sort_order: 0 })
      .select("id, name, sort_order")
      .single();

    if (error) throw error;
    return mapRoomRow(row);
  });

export const updateRoom = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string; data: RoomFormData }) => {
    return {
      id: input.id,
      data: roomFormSchema.parse(input.data),
    };
  })
  .handler(async ({ data }) => {
    const supabase = getSupabase();
    const { data: row, error } = await supabase
      .from("rooms")
      .update({ name: data.data.name })
      .eq("id", data.id)
      .select("id, name, sort_order")
      .single();

    if (error) throw error;
    return mapRoomRow(row);
  });

export const deleteRoom = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    const supabase = getSupabase();
    const { error } = await supabase.from("rooms").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const createShelf = createServerFn({ method: "POST" })
  .inputValidator((input: ShelfFormData) => shelfFormSchema.parse(input))
  .handler(async ({ data }) => {
    const supabase = getSupabase();
    const { data: row, error } = await supabase
      .from("shelves")
      .insert({ name: data.name, room_id: data.roomId, sort_order: 0 })
      .select("id, room_id, name, sort_order")
      .single();

    if (error) throw error;
    return mapShelfRow(row);
  });

export const updateShelf = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string; data: ShelfFormData }) => {
    return {
      id: input.id,
      data: shelfFormSchema.parse(input.data),
    };
  })
  .handler(async ({ data }) => {
    const supabase = getSupabase();
    const { data: row, error } = await supabase
      .from("shelves")
      .update({ name: data.data.name, room_id: data.data.roomId })
      .eq("id", data.id)
      .select("id, room_id, name, sort_order")
      .single();

    if (error) throw error;
    return mapShelfRow(row);
  });

export const deleteShelf = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    const supabase = getSupabase();
    const { error } = await supabase.from("shelves").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });
