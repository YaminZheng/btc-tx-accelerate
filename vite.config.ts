import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  plugins: [
    vue(),
    wasm(),
    topLevelAwait(),
    nodePolyfills({
      globals: { Buffer: true, global: true },
    }),
  ],
});
