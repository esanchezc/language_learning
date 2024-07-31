module.exports = {
    transform: {
        '^.+\\.(js|jsx)$': 'babel-jest',
    },
    moduleNameMapper: {
        '\\.(css|less|scss)$': 'identity-obj-proxy',
    },
    testEnvironment: 'node',
    testMatch: ['**/tests/**/*.test.js'],
    moduleDirectories: ['node_modules', 'src'],
    moduleFileExtensions: ['js', 'json', 'node', 'jsx'],
    roots: ['<rootDir>/src', '<rootDir>/tests'],
};