module.exports = {
  passWithNoTests: true,
  roots: ['<rootDir>/src'],
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  }
};
