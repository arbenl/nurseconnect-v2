module.exports = {
  root: true,
  env: { browser: true, es2022: true },
  parser: "@typescript-eslint/parser",
  plugins: ["react", "@typescript-eslint"],
  extends: ["plugin:react/recommended", "plugin:@typescript-eslint/recommended", "prettier"],
  settings: { react: { version: "18.3" } },
  ignorePatterns: ["dist/**", "node_modules/**"],
};