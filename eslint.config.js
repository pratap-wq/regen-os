import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // Apps Script is validated with `node --check`; its runtime globals are not
  // browser or Node globals and should not be linted as frontend code.
  globalIgnores(['dist', 'apps-script/**']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // These React Compiler diagnostics reject established data-loading
      // effects even though the app does not enable the React Compiler.
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/immutability': 'off',
      'react-hooks/preserve-manual-memoization': 'off',
    },
  },
  {
    // Legacy Month Close helpers remain during the architecture freeze; the
    // active page loads the compact monthClose.controlRoom contract instead.
    files: ['src/pages/MonthlyAudit.jsx'],
    rules: {
      'no-unused-vars': 'off',
    },
  },
])
