import { z } from "zod";

export const difficultySchema = z.enum(["casual", "medium", "hard", "expert"]);

export const roomSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  sortOrder: z.number().int(),
});

export const shelfSchema = z.object({
  id: z.string().uuid(),
  roomId: z.string().uuid(),
  name: z.string().min(1).max(100),
  sortOrder: z.number().int(),
});

export const boardGameSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  shelfId: z.string().uuid(),
  minPlayers: z.number().int().min(1).nullable(),
  maxPlayers: z.number().int().min(1).nullable(),
  durationMinutes: z.number().int().min(1).nullable(),
  minAge: z.number().int().min(1).nullable(),
  difficulty: difficultySchema,
  notes: z.string().max(1000).nullable(),
  imageUrl: z.string().url().nullable(),
});

export const boardGameWithLocationSchema = boardGameSchema.extend({
  shelf: z.object({
    id: z.string().uuid(),
    name: z.string(),
    room: z.object({
      id: z.string().uuid(),
      name: z.string(),
    }).nullable(),
  }).nullable(),
});

export const boardGameFormSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(200),
  shelfId: z.string().uuid("Selecciona un estante"),
  minPlayers: z.number().int().min(1).nullable().optional(),
  maxPlayers: z.number().int().min(1).nullable().optional(),
  durationMinutes: z.number().int().min(1).nullable().optional(),
  minAge: z.number().int().min(1).nullable().optional(),
  difficulty: difficultySchema,
  notes: z.string().max(1000).nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
});

export const roomFormSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(100),
});

export const shelfFormSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(100),
  roomId: z.string().uuid("Selecciona un cuarto"),
});

export const shelfWithRoomSchema = shelfSchema.extend({
  room: z.object({
    id: z.string().uuid(),
    name: z.string(),
  }).nullable(),
});

export type Difficulty = z.infer<typeof difficultySchema>;
export type Room = z.infer<typeof roomSchema>;
export type Shelf = z.infer<typeof shelfSchema>;
export type ShelfWithRoom = z.infer<typeof shelfWithRoomSchema>;
export type BoardGame = z.infer<typeof boardGameSchema>;
export type BoardGameWithLocation = z.infer<typeof boardGameWithLocationSchema>;
export type BoardGameFormData = z.infer<typeof boardGameFormSchema>;
export type RoomFormData = z.infer<typeof roomFormSchema>;
export type ShelfFormData = z.infer<typeof shelfFormSchema>;

export const difficultyLabels: Record<Difficulty, string> = {
  casual: "Casual",
  medium: "Medio",
  hard: "Difícil",
  expert: "Experto",
};

export const difficultyColors: Record<Difficulty, string> = {
  casual: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  hard: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  expert: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};