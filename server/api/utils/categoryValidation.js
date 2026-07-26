const MIN_LENGTH = 2;
const MAX_LENGTH = 40;

function normalizeCategoryName(value) {
  if (typeof value !== 'string') {
    return '';
  }
  return value.trim().replace(/\s+/g, ' ');
}

function getCategoryNameError(value) {
  const name = normalizeCategoryName(value);

  if (!name) {
    return 'Category name is required.';
  }

  if (name.length < MIN_LENGTH || name.length > MAX_LENGTH) {
    return 'Category name must be 2-40 characters.';
  }

  if (!/[\p{L}\p{N}]/u.test(name)) {
    return 'Category name must contain a letter or number.';
  }

  return '';
}

module.exports = {
  normalizeCategoryName,
  getCategoryNameError
};
