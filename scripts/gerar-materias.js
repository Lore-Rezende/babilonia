import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const materiasDir = resolve(projectRoot, "materias");
const outputFile = resolve(projectRoot, "assets/js/materias-data.js");

function decodeHtml(value) {
  const entities = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    nbsp: " ",
    quot: '"',
  };

  return value.replace(/&(#(?:x[\da-f]+|\d+)|[a-z]+);/gi, (entity, code) => {
    if (code.startsWith("#x")) return String.fromCodePoint(Number.parseInt(code.slice(2), 16));
    if (code.startsWith("#")) return String.fromCodePoint(Number.parseInt(code.slice(1), 10));
    return entities[code.toLowerCase()] ?? entity;
  });
}

function textContent(value = "") {
  return decodeHtml(value.replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function classContent(source, className) {
  const pattern = new RegExp(
    `<([a-z][a-z0-9-]*)\\b[^>]*class=["'][^"']*\\b${className}\\b[^"']*["'][^>]*>([\\s\\S]*?)<\\/\\1>`,
    "i",
  );
  return pattern.exec(source)?.[2] ?? "";
}

function attribute(tag, name) {
  return new RegExp(`\\b${name}=["']([^"']*)["']`, "i").exec(tag)?.[1];
}

function normalizeThemes(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function readArticle(filename) {
  const source = readFileSync(resolve(materiasDir, filename), "utf8");
  const title =
    textContent(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i.exec(source)?.[1]) ||
    filename.replace(/\.html$/, "").replaceAll("-", " ");
  const eyebrow = textContent(classContent(source, "eyebrow")) || "Matéria";
  const articleBody = classContent(source, "article-body");
  const summary =
    textContent(classContent(source, "dek")) ||
    textContent(/<p\b[^>]*>([\s\S]*?)<\/p>/i.exec(articleBody)?.[1]) ||
    "Leia a matéria completa.";
  const heroImageStart = source.search(/class=["'][^"']*\bhero-image\b/i);
  const heroImageSource = heroImageStart >= 0 ? source.slice(heroImageStart, heroImageStart + 1500) : "";
  const imageTag = /<img\b[^>]*>/i.exec(heroImageSource)?.[0] ?? "";
  const byline = classContent(source, "byline");
  const readingTime =
    [...byline.matchAll(/<span\b[^>]*>([\s\S]*?)<\/span>/gi)]
      .map((match) => textContent(match[1]))
      .find((text) => text.includes("min")) || "Leia agora";

  return {
    filename,
    title,
    eyebrow,
    summary,
    imageSrc: attribute(imageTag, "src"),
    imageAlt: decodeHtml(attribute(imageTag, "alt") || title),
    readingTime,
    themes: normalizeThemes(`${eyebrow} ${title} ${summary}`),
  };
}

export function generateMateriasCatalog() {
  const materias = readdirSync(materiasDir)
    .filter((filename) => filename.endsWith(".html") && filename !== "index.html")
    .map(readArticle)
    .sort((a, b) => a.title.localeCompare(b.title, "pt-BR"));

  writeFileSync(
    outputFile,
    `// Gerado automaticamente por scripts/gerar-materias.js.\nexport const materias = ${JSON.stringify(materias, null, 2)};\n`,
  );

  return materias;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const materias = generateMateriasCatalog();
  console.log(`${materias.length} matérias adicionadas ao catálogo.`);
}
