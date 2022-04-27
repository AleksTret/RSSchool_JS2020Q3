module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: [
    'eslint:recommended',
    'airbnb-base',
    'plugin:react-hooks/recommended',
  ],
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {
    'eol-last': ['error', 'always'],
    'no-underscore-dangle': ['error', { allowAfterThis: true }],
    'no-console': 'off',
    'no-plusplus': ['error', { 'allowForLoopAfterthoughts': true }],
    'class-methods-use-this': 'off',
    'no-use-before-define': 'off'
  },
};
