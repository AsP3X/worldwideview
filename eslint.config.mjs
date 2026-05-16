import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

export default [
    {
        ignores: [
            "node_modules/**",
            ".next/**",
            "out/**",
            "src/generated/**",
            "public/cesium/**",
            "packages/*/dist/**",
            ".worktrees/**",
            "local-scripts/**",
            "local-plugins/**",
            "local-seeders/**",
            ".agents/**",
            ".claude/**",
        ],
    },
    ...nextCoreWebVitals,
    ...nextTypeScript,
    {
        rules: {
            // ─── Re-enabled Strict Rules ─────────────────────────────
            // The codebase has been baselined with suppress-eslint-errors.
            // All new code must adhere to these strict rules.

            "@typescript-eslint/no-explicit-any": "error",
            "no-console": "error",

            // React 19 hook-purity rules from eslint-plugin-react-hooks 7+:
            "react-hooks/purity": "error",
            "react-hooks/refs": "error",
            "react-hooks/set-state-in-effect": "error",
            "react-hooks/immutability": "error",
            "react-hooks/static-components": "error",

            // Misc one-offs across the codebase:
            "react/no-unescaped-entities": "error",
            "@typescript-eslint/ban-ts-comment": "error",
            "@next/next/no-assign-module-variable": "error",
            "prefer-const": "error",
        },
    },
];
