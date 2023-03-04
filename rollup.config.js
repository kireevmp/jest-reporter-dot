import typescript from "@rollup/plugin-typescript"

/**
 * @type {import('rollup').RollupOptions}
 */
export default {
  input: "src/index.ts",
  plugins: [typescript()],
  external: ['chalk'],
  output: [
    {
      format: "esm",
      file: "dist/index.mjs"
    },
    {
      format: "cjs",
      file: "dist/index.cjs"
    },
  ],
}
