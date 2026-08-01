const Category = require('../models/categoryModel');
const Word = require('../models/wordModel');

// ── helpers ──────────────────────────────────────────────────────────────

const isGeneral = (name) => (name || '').trim().toLowerCase() === 'general';

const normalizeCategoryName = (name) =>
  typeof name === 'string' ? name.trim().replace(/\s+/g, ' ') : '';

const sameCategoryName = (firstName, secondName) =>
  normalizeCategoryName(firstName).toLowerCase() ===
  normalizeCategoryName(secondName).toLowerCase();

const getCategoryValidationError = (name, categories, excludeId = null) => {
  if (!name || !name.trim()) return 'Category name is required.';
  if (name.trim().length < 2) return 'Category name must be at least 2 characters.';
  if (name.trim().length > 40) return 'Category name cannot exceed 40 characters.';
  if (isGeneral(name)) return 'General is a protected category.';

  const duplicate = categories.find((cat) => {
    if (excludeId && cat._id.toString() === excludeId) return false;
    return sameCategoryName(cat.name, name);
  });

  if (duplicate) return 'Category already exists.';
  return null;
};

// ── CRUD ─────────────────────────────────────────────────────────────────

exports.list_all_categories = async (req, res) => {
  try {
    const categories = await Category.find({});
    categories.sort((a, b) => {
      if (isGeneral(a.name)) return -1;
      if (isGeneral(b.name)) return 1;
      return a.name.localeCompare(b.name);
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load categories.' });
  }
};

exports.create_a_category = async (req, res) => {
  try {
    const name = normalizeCategoryName(req.body.name);
    const categories = await Category.find({});

    const error = getCategoryValidationError(name, categories);
    if (error) return res.status(400).json({ message: error });

    const newCategory = new Category({ name });
    const saved = await newCategory.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create category.' });
  }
};

exports.update_a_category = async (req, res) => {
  try {
    const category = await Category.findById(req.params.categoryId);
    if (!category) return res.status(404).json({ message: 'Category not found.' });
    if (isGeneral(category.name)) return res.status(400).json({ message: 'Cannot edit General category.' });

    const newName = normalizeCategoryName(req.body.name);
    const categories = await Category.find({});

    const error = getCategoryValidationError(newName, categories, req.params.categoryId);
    if (error) return res.status(400).json({ message: error });

    const oldName = category.name;

    category.name = newName;
    const updated = await category.save();

    await Word.updateMany(
      { category: oldName },
      { $set: { category: newName } }
    );

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update category.' });
  }
};

exports.delete_a_category = async (req, res) => {
  try {
    const category = await Category.findById(req.params.categoryId);
    if (!category) return res.status(404).json({ message: 'Category not found.' });
    if (isGeneral(category.name)) return res.status(400).json({ message: 'Cannot delete General category.' });

    const wordCount = await Word.countDocuments({ category: category.name });
    if (wordCount > 0) {
      return res.status(409).json({ message: `Cannot delete. ${wordCount} word(s) are using this category.` });
    }

    await Category.findByIdAndDelete(req.params.categoryId);
    res.json({ message: 'Category deleted successfully.' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
