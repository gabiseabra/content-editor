import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  framework: "@storybook/react-vite",
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-docs"],
  viteFinal: async (cfg) => {
    cfg.resolve ??= {};
    cfg.resolve.conditions = ["source", ...(cfg.resolve.conditions ?? [])];
    return cfg;
  },
};

export default config;
