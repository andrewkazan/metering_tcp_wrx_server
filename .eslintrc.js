module.exports = {
    env: {
        browser: true,
        es6: true
    },
    extends: ['eslint:recommended', 'plugin:node/recommended', 'plugin:import/errors', 'plugin:import/warnings'],
    globals: {
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly'
    },
    parser: 'babel-eslint',
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        allowImportExportEverywhere: true
    },
    rules: {
        semi: ['error', 'always'],
        'node/no-unsupported-features/es-syntax': [
            'warn',
            {
                version: '>=8.10.0', // overwrites version from package.json
                ignores: ['modules']
            }
        ],
        'node/no-missing-import': 'off',
        'node/no-missing-require': 'off',
        'no-unused-vars': 'warn',
        'import/default': 'off',
        'node/no-unpublished-require': 'off',
        'no-process-exit': 'warn',
        'no-debugger': 'warn'
    }
};
