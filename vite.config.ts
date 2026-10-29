import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  test: {
    environment: "node",
    clearMocks: true,
    restoreMocks: true,

    include: [
      "src/**/*.test.ts",
      "src/**/*.test.tsx",
      "src/**/*.spec.ts",
      "src/**/*.spec.tsx",
    ],

    coverage: {
      provider: "v8",
      reporter: ["text", "html"],

      // Shopping Cart ke active source modules
      include: [
        "src/api/products.ts",
        "src/components/ApiProducts.tsx",
        "src/components/ErrorBoundary.tsx",
        "src/components/CatalogProductCard.tsx",
        "src/components/ProductImage.tsx",
        "src/hooks/useProducts.ts",
        "src/reducers/cartReducer.ts",
        "src/utils/cartStorage.ts",
      ],

      // Test files aur type declarations ko coverage se exclude karo
      exclude: [
        "src/**/*.test.ts",
        "src/**/*.test.tsx",
        "src/**/*.spec.ts",
        "src/**/*.spec.tsx",
        "src/**/*.d.ts",
      ],

      reportsDirectory: "coverage",

      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
        perFile: true,
      },
    },
  },
});
