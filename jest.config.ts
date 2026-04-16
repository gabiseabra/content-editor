/** @jest-config-loader ts-node */
/** @jest-config-loader-options {"transpileOnly": true} */
import * as fs from "fs";
import type { Config } from "jest";

export default {
  projects: (["core", "utils", "editable", "docs"] as const).map(
    (workspace): Config => ({
      displayName: workspace,
      rootDir: process.cwd(),
      testEnvironment: "jsdom",
      testMatch: [
        `${process.cwd()}/${workspace}/src/**/*.test.ts`,
        `${process.cwd()}/${workspace}/src/**/*.test.tsx`,
        `${process.cwd()}/${workspace}/src/**/*.spec.ts`,
        `${process.cwd()}/${workspace}/src/**/*.spec.tsx`,
      ],
      extensionsToTreatAsEsm: [".ts", ".tsx"],
      transform: {
        "^.+\\.tsx?$": [
          "ts-jest",
          {
            useESM: true,
            tsconfig: resolveTsconfig(workspace),
            diagnostics: false,
          },
        ],
      },
      moduleNameMapper: {
        "^.+/env(\\.js)?$": `${process.cwd()}/${workspace}/src/test-utils/env.ts`,
        // Strip .js from relative imports so Jest can resolve TS sources.
        "^(\\.{1,2}/.*)\\.js$": "$1",
        "\\.(css|scss|sass)$": "identity-obj-proxy",
      },
      setupFiles: [`${process.cwd()}/test/setup.ts`],
      setupFilesAfterEnv: [
        "@testing-library/jest-dom",
        `${process.cwd()}/test/setup-after-env.ts`,
      ],
    }),
  ),
};

function resolveTsconfig(workspace: string) {
  const root = `${process.cwd()}/${workspace}`;
  return fs.existsSync(`${root}/tsconfig.build.json`)
    ? `${root}/tsconfig.build.json`
    : `${root}/tsconfig.json`;
}
