export function normalizeCategoryName(name) {
  if (typeof name !== 'string') {
    return '';
  }

  return name.trim().replace(/\s+/g, ' ');
}

export function getCategoryNameError(name) {
  const normalized = normalizeCategoryName(name);

  if (!normalized) {
    return 'Category name is required.';
  }

  if (normalized.length < 2 || normalized.length > 40) {
    return 'Category name must be 2-40 characters.';
  }

  if (!/[\p{L}\p{N}]/u.test(normalized)) {
    return 'Category name must contain a letter or number.';
  }

  return '';
}

export function isGeneralCategoryName(name) {
  return normalizeCategoryName(name).toLowerCase() === 'general';
}
