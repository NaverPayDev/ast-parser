module.exports = {
    preset: 'ts-jest',
    testMatch: ['<rootDir>/src/**/*.test.[jt]s'],
    testPathIgnorePatterns: ['/node_modules/', '/dist'],
}
