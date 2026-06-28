import { createConfig } from '@krislintigo/eslint-config'

export default createConfig({
  extraRules: {
    '@typescript-eslint/strict-boolean-expressions': 'off',
  },
})
