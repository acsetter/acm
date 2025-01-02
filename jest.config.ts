import type { Config } from 'jest';

const config: Config = {
    roots: ['<rootDir>', '<rootDir>/test'],
    testMatch: ['**/*.unit.test.ts'],
    transform: {
        '^.+\\.tsx?$': ['ts-jest', { isolatedModules: true }],
    },
    transformIgnorePatterns: ['node_modules/'],
    testEnvironment: 'node',
    reporters: ['default'],
};

export default config;
