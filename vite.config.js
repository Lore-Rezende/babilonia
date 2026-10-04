import { defineConfig } from "vite";
import { resolve } from "node:path";

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
        materiaBallroom: resolve(__dirname, "materias/ballroom/index.html"),
        materiaAcademia: resolve(__dirname, "materias/academia/index.html"),
        materiaLancamentos: resolve(__dirname, "materias/lancamentos/index.html"),
        materiaPrada: resolve(__dirname, "materias/diabo-veste-prada/index.html"),
        materiaCortez: resolve(__dirname, "materias/cortez/index.html"),
        manifesto: resolve(__dirname, "manifesto/index.html"),
        agenda: resolve(__dirname, "agenda/index.html"),
        sobre: resolve(__dirname, "sobre/index.html"),
        edicao: resolve(__dirname, "edicao/index.html"),
        revista: resolve(__dirname, "revista/index.html"),
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
