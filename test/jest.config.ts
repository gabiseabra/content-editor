/** @jest-config-loader ts-node */
/** @jest-config-loader-options {"transpileOnly": true} */
import * as fs from "fs";
import type { Config } from "jest";
import * as path from "path";

const projectRoot = path.resolve(__dirname, "..");

export default {
  projects: (["editor", "common", "editable", "docs"] as const).map(
    (workspace): Config => ({
      displayName: workspace,
      rootDir: process.cwd(),
      testEnvironment: "jsdom",
      testMatch: [
        `${projectRoot}/${workspace}/src/**/*.test.ts`,
        `${projectRoot}/${workspace}/src/**/*.test.tsx`,
        `${projectRoot}/${workspace}/src/**/*.spec.ts`,
        `${projectRoot}/${workspace}/src/**/*.spec.tsx`,
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
      setupFiles: [`${projectRoot}/test/jest/setup.ts`],
      setupFilesAfterEnv: [
        "@testing-library/jest-dom",
        `${projectRoot}/test/jest/setup-after-env.ts`,
      ],
    }),
  ),
};

function resolveTsconfig(workspace: string) {
  const workspaceRoot = `${projectRoot}/${workspace}`;
  return fs.existsSync(`${workspaceRoot}/tsconfig.build.json`)
    ? `${workspaceRoot}/tsconfig.build.json`
    : `${workspaceRoot}/tsconfig.json`;
}
