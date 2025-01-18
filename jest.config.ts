import type { Config } from 'jest';

const config: Config = {
    roots: ['<rootDir>', '<rootDir>/test'],
    testMatch: ['**/*.test.ts'],
    transform: {
        '^.+\\.tsx?$': ['ts-jest', { isolatedModules: true }],
    },
    transformIgnorePatterns: ['node_modules'],
    testEnvironment: 'node',
};

export default config;
