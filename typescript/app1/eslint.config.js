import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier"; // Import prettier config

export default [
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  // Add prettier config last to override other configs
  eslintConfigPrettier,
  {
    // Apply rules specifically to TS files
    files: ["**/*.ts"],
    languageOptions: {
      parser: tseslint.parser,
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    rules: {
      // Remove the custom no-restricted-syntax rule
      // Prettier will handle formatting
    }
  }
];
