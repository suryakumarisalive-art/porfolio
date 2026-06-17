import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({ baseDirectory: __dirname })

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      // Enforce no `any` — strict mode mandate (non-typed rule, works without parserOptions.project)
      '@typescript-eslint/no-explicit-any': 'error',
      // No console.log in production code
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      // Immutability signals
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
]

export default eslintConfig
