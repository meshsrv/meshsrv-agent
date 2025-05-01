import { dts } from "rollup-plugin-dts";

/** @type {import('rollup').RollupOptions} */
export default {
  input: "./models/shared/index.ts",
  output: {
    file: "./models/shared/agent.d.ts",
    format: "es",
  },
  external: ["@types/node"],
  plugins: [dts({ respectExternal: true })],
};
