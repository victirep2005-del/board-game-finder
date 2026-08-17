import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  const text = readFileSync(filePath, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (process.env[key] !== undefined) continue;
    let value = rawValue.trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    process.env[key] = value;
  }
}

loadEnvFile(resolve(process.cwd(), ".env.local"));
loadEnvFile(resolve(process.cwd(), ".env"));

const SOURCE_URL = "https://teletype.in/@ramsesqh/Coleccion";
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const SHELF_ID = process.env.SHELF_ID;
const DO_IMPORT = process.argv.includes("--import");

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Faltan SUPABASE_URL y SUPABASE_PUBLISHABLE_KEY (o las variables VITE_* equivalentes).");
  process.exit(1);
}

function decodeEntities(value) {
  return value.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ");
}
function cleanText(value) {
  return decodeEntities(value.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
}
function difficulty(category) {
  const c = category.toLocaleLowerCase();
  if (c.includes("estrategia abstracta")) return "medium";
  if (c === "estrategia" || c.includes("temático")) return "hard";
  if (c.includes("roles ocultos")) return "medium";
  return "casual";
}
function minutes(value) {
  const nums = [...value.matchAll(/\d+/g)].map((m) => Number(m[0]));
  if (!nums.length) return null;
  return nums.length > 1 ? Math.round((nums[0] + nums[1]) / 2) : nums[0];
}
function parseCollection(html) {
  const normalized = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<(br|\/p|\/div|\/li|\/h[1-6]|\/section|\/article)[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, " ");
  const lines = normalized.split(/\n+/).map(cleanText).filter(Boolean);
  const result = [];
  for (let i = 0; i < lines.length - 2; i++) {
    const name = lines[i];
    const category = lines[i + 1];
    const details = lines[i + 2];
    const parts = details.split("|").map((p) => p.trim());
    const players = parts.find((p) => /^\d+(?:-\d+)?$/.test(p));
    const age = parts.find((p) => /^\d+\+$/.test(p));
    if (!players || !age) continue;
    const [minPlayers, maxPlayers] = players.split("-").map(Number);
    const minAge = Number(age.slice(0, -1));
    if (!name || !category || !Number.isFinite(minAge)) continue;
    if (result.some((g) => g.name.toLocaleLowerCase() === name.toLocaleLowerCase())) continue;
    const duration = parts.find((p) => /\d/.test(p) && p !== players && p !== age) || "";
    result.push({
      name: name.replace(/\s*~~\s*$/, "").trim(),
      category,
      min_players: minPlayers || null,
      max_players: maxPlayers || minPlayers || null,
      duration_minutes: minutes(duration),
      min_age: minAge || null,
      difficulty: difficulty(category),
    });
  }
  return result;
}

const response = await fetch(SOURCE_URL, { headers: { "User-Agent": "Mozilla/5.0" } });
if (!response.ok) throw new Error(`No se pudo descargar la colección (${response.status}).`);
const games = parseCollection(await response.text());
console.log(`\nColección encontrada: ${games.length} juegos.`);

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });
const { data: shelves, error: shelfError } = await supabase.from("shelves").select("id,name,rooms:room_id(name)").order("name");
if (shelfError) throw shelfError;
console.log("\nEstantes disponibles:");
for (const shelf of shelves ?? []) console.log(`  ${shelf.id}  ${shelf.name} — ${shelf.rooms?.name ?? "Sin cuarto"}`);

if (!SHELF_ID) {
  console.log("\nModo PREVISUALIZACIÓN. Para importar, define SHELF_ID con el estante elegido y añade --import.");
  console.log("Ejemplo: SHELF_ID='ID_DEL_ESTANTE' npm run import:legacy -- --import\n");
  for (const [index, game] of games.entries()) console.log(`${index + 1}. ${game.name} | ${game.category} | ${game.min_players}-${game.max_players} | ${game.duration_minutes ?? "?"} min | ${game.min_age ?? "?"}+ | ${game.difficulty}`);
  process.exit(0);
}

const { data: existing, error: existingError } = await supabase.from("board_games").select("name");
if (existingError) throw existingError;
const existingNames = new Set((existing ?? []).map((g) => String(g.name).trim().toLocaleLowerCase()));
const toInsert = games.filter((g) => !existingNames.has(g.name.trim().toLocaleLowerCase())).map((g) => ({ ...g, shelf_id: SHELF_ID, notes: `Importado de la colección antigua · Categoría: ${g.category}`, image_url: null }));
console.log(`\nNuevos: ${toInsert.length}. Ya existentes/omitidos: ${games.length - toInsert.length}.`);
if (!DO_IMPORT) {
  console.log("No se insertó nada. Añade --import para confirmar la importación.\n");
  process.exit(0);
}
if (!toInsert.length) { console.log("No hay juegos nuevos que importar."); process.exit(0); }
const { error: insertError } = await supabase.from("board_games").insert(toInsert);
if (insertError) throw insertError;
console.log(`\nIMPORTACIÓN COMPLETADA: ${toInsert.length} juegos insertados.`);
