import js from '@eslint/js';

export default [
    js.configs.recommended,
    {
        languageOptions: {
            globals: {
                document: 'readonly',
                localStorage: 'readonly',
                requestAnimationFrame: 'readonly',
                console: 'readonly'
            }
        },
        rules: {
            'no-unused-vars': 'warn',
            'no-undef': 'off'
        }
    }
];
