import { defineConfig } from "vite";
import { resolve } from "node:path";
import { readdirSync } from "node:fs";

const materiasDir = resolve(__dirname, "materias");
const materiaInputs = Object.fromEntries(
  readdirSync(materiasDir)
    .filter((file) => file.endsWith(".html") && file !== "index.html")
    .map((file) => [
      `materia-${file.replace(/\.html$/, "")}`,
      resolve(materiasDir, file),
    ]),
);

export default defineConfig({
  base: process.env.FIGMA_PUBLIC_URL
    ? `${process.env.FIGMA_PUBLIC_URL}/`
    : "/",
  build: {
    rollupOptions: {
      input: {
        raiz: resolve(__dirname, "index.html"),
        inicio: resolve(__dirname, "inicio/index.html"),
        materias: resolve(__dirname, "materias/index.html"),
        ...materiaInputs,
        manifesto: resolve(__dirname, "manifesto/index.html"),
        agenda: resolve(__dirname, "agenda/index.html"),
        sobre: resolve(__dirname, "sobre/index.html"),
        edicao: resolve(__dirname, "edicao/index.html"),
      },
    },
  },
  server: {
    host: process.env.FIGMA_DEV_SERVER_HOST || "0.0.0.0",
    port: Number(process.env.PORT || 8443),
    strictPort: true,
  },
  preview: {
    host: process.env.FIGMA_DEV_SERVER_HOST || "0.0.0.0",
    port: Number(process.env.PORT || 8443),
  },
});
