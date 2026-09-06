#!/usr/bin/env node
/**
 * Genera data/library-index.json a partir de library/ y library2/.
 * Ejecutar desde la raíz del proyecto:
 *   node tools/build-library-index.mjs
 */
import { promises as fs } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const LIBRARIES = ["library", "library2"];
const OUTPUT = path.join(ROOT, "data", "library-index.json");

async function walk(dir) {
  const out = [];
  let entries = [];
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch (error) {
    if (error?.code === "ENOENT") return out;
    throw error;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await walk(full));
    else if (entry.isFile() && entry.name.toLowerCase().endsWith(".json")) out.push(full);
  }
  return out;
}

function posixRelative(file) {
  return path.relative(ROOT, file).split(path.sep).join("/");
}

function fallbackTitle(filename) {
  return filename
    .replace(/\.json$/i, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const files = (await Promise.all(
  LIBRARIES.map(folder => walk(path.join(ROOT, folder)))
)).flat();

const basenameMap = new Map();
const duplicates = [];
const songs = [];

for (const file of files) {
  const filename = path.basename(file);
  const key = filename.toLocaleLowerCase("es");
  if (basenameMap.has(key)) {
    duplicates.push([basenameMap.get(key), posixRelative(file)]);
    continue;
  }
  basenameMap.set(key, posixRelative(file));

  let json;
  try {
    json = JSON.parse(await fs.readFile(file, "utf8"));
  } catch (error) {
    console.warn(`⚠ JSON inválido: ${posixRelative(file)} (${error.message})`);
    continue;
  }

  const doc = json?.document || json?.song || json || {};
  songs.push({
    filename,
    path: posixRelative(file),
    title: String(doc.title || fallbackTitle(filename)).trim(),
    composer: String(doc.composer || "").trim()
  });
}

if (duplicates.length) {
  console.error("\\nERROR: hay nombres de archivo repetidos entre library/library2.");
  console.error("La API de ATA usa el filename como identificador, por lo que deben ser únicos:");
  for (const [a, b] of duplicates) console.error(`  - ${a}\\n    ${b}`);
  process.exit(2);
}

songs.sort((a, b) =>
  a.title.localeCompare(b.title, "es", { sensitivity: "base" }) ||
  a.filename.localeCompare(b.filename, "es", { sensitivity: "base" })
);

await fs.mkdir(path.dirname(OUTPUT), { recursive: true });
await fs.writeFile(OUTPUT, JSON.stringify(songs, null, 2) + "\n", "utf8");

console.log(`✓ ${songs.length} canciones indexadas.`);
console.log(`✓ ${path.relative(ROOT, OUTPUT)}`);
