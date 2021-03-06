module.exports = {
  '*.{ts,js}': ['eslint --fix', 'prettier --write'],
  '*.md': ['prettier --write'],
  'yarn.lock': ['yarn-deduplicate'],
};
