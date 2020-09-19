module.exports = {
  collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}'],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
  resetMocks: true,
  // TODO figure out why jest can't find this when we uncomment it
  // preset: 'ts-jest/presets/js-with-ts',
  roots: ['src'],
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>test/setup.js'],
  testRegex: '/__tests__/.*\\.test.[jt]s$',
  testURL: 'http://localhost',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  transformIgnorePatterns: [],
};
