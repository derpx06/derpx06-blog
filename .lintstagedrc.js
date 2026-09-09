// INERT: no husky/git hook invokes lint-staged, so this never runs. CI
// (.github/workflows/ci.yml) is what actually enforces lint and format.
module.exports = {
  "*.{js,jsx,ts,tsx}": (filenames) => [
    `biome check --write ${filenames.map((f) => `"${f}"`).join(" ")}`,
    `biome format --write ${filenames.map((f) => `"${f}"`).join(" ")}`,
  ],
  "*.{json}": (filenames) => [`biome format --write ${filenames.map((f) => `"${f}"`).join(" ")}`],
};
