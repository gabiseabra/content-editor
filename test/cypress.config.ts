import { defineConfig } from "cypress";
import viteConfig from "./vite.config.js";

export default defineConfig({
  fixturesFolder: "test/cypress/fixtures",
  screenshotsFolder: "test/cypress/screenshots",

  component: {
    supportFile: "test/cypress/support/component.ts",
    indexHtmlFile: "test/cypress/support/component-index.html",
    devServer: {
      framework: "react",
      bundler: "vite",
      viteConfig: () =>
        viteConfig({
          command: "build",
          mode: "test",
        }),
    },
    excludeSpecPattern: ["**/dist/**/*"],
  },

  // why not set this to false by default . . . ?
  allowCypressEnv: false,
});
