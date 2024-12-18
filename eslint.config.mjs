// @ts-check

import eslint from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginUnicorn from "eslint-plugin-unicorn";
import functional from "eslint-plugin-functional";
import tseslint from "typescript-eslint";

import typescriptParser from "@typescript-eslint/parser";

export default [
  eslint.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.strict,
  eslintPluginUnicorn.configs["flat/recommended"],
  functional.configs.lite,
  {
    ignores: ["typings/*"],
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
        },
      ],
      "functional/no-loop-statements": "off",
      "functional/no-mixed-types": "off",
      "functional/no-return-void": "off",
      "functional/prefer-immutable-types": "off",
      "functional/no-throw-statements": "off",
      "sort-imports": [
        "error",
        {
          allowSeparatedGroups: true,
          ignoreMemberSort: true,
        },
      ],
      "unicorn/filename-case": [
        "error",
        {
          cases: {
            kebabCase: true,
            pascalCase: true,
          },
        },
      ],
      "unicorn/no-array-reduce": "off",
      "unicorn/prefer-top-level-await": "off",
      "unicorn/prevent-abbreviations": [
        "error",
        {
          allowList: {
            Db: true,
            Dir: true,
            Param: true,
            Params: true,
            Props: true,
            Ref: true,
            acc: true,
            args: true,
            db: true,
            dir: true,
            e2e: true,
            env: true,
            fn: true,
            params: true,
            props: true,
            ref: true,
          },
        },
      ],
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: { project: "./tsconfig.json" },
    },
  },
];
