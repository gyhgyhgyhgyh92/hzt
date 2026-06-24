module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '**/__tests__/**/*.js',
    '**/*.test.js',
    '**/*.spec.js'
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/'
  ],
  collectCoverageFrom: [
    'src/services/**/*.js',
    'src/**/*.js'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
}