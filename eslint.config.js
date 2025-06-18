import stylistic from '@stylistic/eslint-plugin'
import ts from 'typescript-eslint'

export default ts.config(
  ...ts.configs.recommended,
  {
    plugins: {
      '@stylistic': stylistic,
    },
    rules: {
      '@stylistic/indent': ['error', 2],
      '@stylistic/no-trailing-spaces': 'error',
      '@stylistic/quotes': ['error', 'single'],
      '@stylistic/comma-dangle': ['error', { objects: 'always-multiline' }],
      '@stylistic/object-curly-spacing': ['error', 'always'],
      '@stylistic/semi': ['error', 'never'],
    },
  },
  {
    ignores: ['build/', 'dist/'],
  }
)
