import js from '@eslint/js'
import globals from 'globals'
import checkFile from 'eslint-plugin-check-file'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.recommended,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    plugins: {
      'check-file': checkFile,
    },
    rules: {
      // Filenames must be all lowercase (letters, digits, -, _ only)
      'check-file/filename-naming-convention': [
        'error',
        {
          '**/*.{ts,tsx}': '+([a-z0-9_-])',
        },
        {
          ignoreMiddleExtensions: true,
          errorMessage:
            'Filename "{{ target }}" must be all lowercase (pattern: {{ pattern }})',
        },
      ],
    },
  },
])
