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
  console.error("Faltan SUPABASE_URL y SUPABASE_PUBLISHABLE_KEY (o las variables VITE_* equivalentes).");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });
const prefix = "Importado de la colección antigua";
const { data, error } = await supabase.from("board_games").select("name,category,notes").not("category", "is", null).like("notes", `${prefix}%`).order("name");
if (error) throw error;

console.log(`Juegos con notas de importación antigua: ${data?.length ?? 0}`);
for (const game of data ?? []) console.log(`- ${game.name} | ${game.category ?? "sin categoría"}`);

if (!DO_UPDATE) {
  console.log("\nModo PREVISUALIZACIÓN. No se modificó nada.");
  console.log("Para borrar esas notas, ejecuta: npm run clear:legacy-notes -- --update");
  process.exit(0);
}

const { data: updated, error: updateError } = await supabase
  .from("board_games")
  .update({ notes: null })
  .not("category", "is", null)
  .like("notes", `${prefix}%`)
  .select("name");
if (updateError) throw updateError;
console.log(`\nLimpieza completada: ${updated?.length ?? 0} juegos actualizados. Las categorías y demás datos permanecen intactos.`);
