import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;
  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match || process.env[match[1]] !== undefined) continue;
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    process.env[match[1]] = value;
  }
}
loadEnvFile(resolve(process.cwd(), ".env.local"));
loadEnvFile(resolve(process.cwd(), ".env"));

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const DO_UPDATE = process.argv.includes("--update");

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Faltan las variables de Supabase.");
  process.exit(1);
}

const categories = [
  "Cartas",
  "Cooperativo",
  "Dados",
  "Estrategia",
  "Estrategia Abstracta",
  "Estrategia Ligera",
  "Fiesta",
  "Roles Ocultos",
  "Temático",
];

console.log("Categorias a crear:");
for (const category of categories) console.log(`  - ${category}`);

if (!DO_UPDATE) {
  console.log("\nPREVISUALIZACIÓN: no se modifica la base de datos.");
  console.log("Primero añade la columna category en Supabase y luego ejecuta con --update.");
  process.exit(0);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });
const { data: games, error } = await supabase.from("board_games").select("name,notes");
if (error) throw error;

const categoryPattern = /Categoría original:\s*([^·]+?)(?:\s*$|\s*·)/i;
const updates = [];
for (const game of games ?? []) {
  const match = String(game.notes ?? "").match(categoryPattern);
  if (!match) continue;
  const category = categories.find((c) => c.toLocaleLowerCase() === match[1].trim().toLocaleLowerCase());
  if (category) updates.push({ name: game.name, category });
}

console.log(`\nJuegos con categoría reconocida: ${updates.length}`);
if (!DO_UPDATE) process.exit(0);
if (!updates.length) process.exit(0);

for (const update of updates) {
  const { error: updateError } = await supabase.from("board_games").update({ category: update.category }).eq("name", update.name);
  if (updateError) throw updateError;
}
console.log(`Actualización completada: ${updates.length} juegos.`);
