import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true, // Permite el uso de variables globales como `describe`, `it`, etc.
    environment: "node", // Configura el entorno de prueba, puede ser 'jsdom' o 'node'
    setupFiles: "./vitest.setup.ts", // Archivo para configuración global antes de cada test
    // Puedes especificar los patrones de archivos de test que Vitest debe encontrar
    include: ["src/testing/**/*.test.ts"],
    coverage: {
      provider: "istanbul", // Proveedor de cobertura, puede ser 'c8' o 'istanbul'
      reporter: ["text", "lcov"], // Reporteros de cobertura
      all: true, // Cobertura de todos los archivos, no solo los testeados
      include: ["src/**/*.{ts,tsx}"], // Incluir archivos para cobertura
      exclude: ["node_modules", "dist"], // Excluir archivos innecesarios
    },
  },
});
