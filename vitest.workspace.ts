/// <reference types="vitest" />
import { defineWorkspace } from "vitest/config";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";

const nodeTestPaths = ["../tests/unit/**/*.node.{test,spec}.ts"];
const browserTestPaths = ["../tests/unit/**/*.browser.{test,spec}.ts"];
const normalTestPaths = ["../tests/unit/**/*.{test,spec}.ts"];

const ignorePaths = (paths: string[]) => paths.map((path) => `!${path}`);

export default defineWorkspace([
  // Node.js環境
  {
    extends: "./vite.config.ts",
    test: {
      include: nodeTestPaths,
      name: "node",
      environment: "node",
      globals: true,
    },
  },

  // happy-domのエミュレート版ブラウザ環境
  {
    extends: "./vite.config.ts",
    plugins: [],
    test: {
      include: [
        ...normalTestPaths,
        ...ignorePaths(nodeTestPaths),
        ...ignorePaths(browserTestPaths),
      ],
      globals: true,
      name: "unit",
      environment: "happy-dom",
    },
  },

  // Chromiumブラウザ環境
  {
    extends: "./vite.config.ts",
    test: {
      include: browserTestPaths,
      globals: true,
      name: "browser",
      browser: {
        enabled: true,
        instances: [{ browser: "chromium" }],
        provider: "playwright",
        headless: true,
        api: 7158,
        ui: false,
      },
    },
  },

  // Storybook
  {
    extends: "./vite.config.ts",
    plugins: [
      storybookTest({
        storybookScript: "storybook --ci --port 7160",
        storybookUrl: "http://localhost:7160",
      }),
    ],
    resolve: {
      alias: {
        // NOTE: Storybookで`template:`指定を使うために必要
        vue: "vue/dist/vue.esm-bundler.js",
      },
    },
    test: {
      globals: true,
      name: "storybook",
      browser: {
        enabled: true,
        instances: [{ browser: "chromium" }],
        provider: "playwright",
        headless: true,
        api: 7159,
        ui: false,
      },
      isolate: false,
      setupFiles: ["./.storybook/vitest.setup.ts"],
    },
  },
]);
