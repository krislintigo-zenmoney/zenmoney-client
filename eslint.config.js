import { createConfig } from '@krislintigo/eslint-config'

export default createConfig({
  extraConfigs: [
    // Disable redundant type aliases for types files only
    {
      files: ['src/**/*.types.ts'],
      rules: {
        'sonarjs/redundant-type-aliases': 'off',
      },
    },
  ],
})
