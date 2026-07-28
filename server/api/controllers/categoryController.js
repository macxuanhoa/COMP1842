const Category = require('../models/categoryModel');
const Word = require('../models/wordModel');
const { normalizeCategoryName, getCategoryNameError } = require('../utils/categoryValidation');

function isGeneralName(name) {
  return normalizeCategoryName(name).toLowerCase() === 'general';
}

function handleError(res, err) {
  if (err.name === 'ValidationError' || err.name === 'CastError') return res.status(400).json({ message: err.message });
  if (err.code === 11000) return res.status(409).json({ message: 'Category already exists.' });
  console.error(err);
  return res.status(500).json({ message: 'Unexpected error' });
}

exports.list_all_categories = async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).send({ message: 'Unexpected error' });
  }
};

exports.create_a_category = async (req, res) => {
  try {
    const name = normalizeCategoryName(req.body.name || '');
    const error = getCategoryNameError(name);

    if (error) {
      return res.status(400).send({ message: error });
    }

    if (isGeneralName(name)) {
      return res.status(400).send({ message: 'General is a protected category.' });
    }

    // case-insensitive duplicate check
    const categories = await Category.find({});
    const duplicate = categories.find(
      c => normalizeCategoryName(c.name).toLowerCase() === name.toLowerCase()
    );
    if (duplicate) {
      return res.status(409).send({ message: 'Category already exists.' });
    }

    const newCategory = new Category({ name });
    const saved = await newCategory.save();
    res.status(201).json(saved);
  } catch (err) { handleError(res, err); }
};

exports.update_a_category = async (req, res) => {
  try {
    const category = await Category.findById(req.params.categoryId);
    if (!category) {
      return res.status(404).send({ message: 'Category not found' });
    }

    if (isGeneralName(category.name)) {
      return res.status(400).send({ message: 'Cannot edit General category.' });
    }

    const newName = normalizeCategoryName(req.body.name || '');
    const error = getCategoryNameError(newName);

    if (error) {
      return res.status(400).send({ message: error });
    }

    if (isGeneralName(newName)) {
      return res.status(400).send({ message: 'General is a protected category.' });
    }

    // case-insensitive duplicate check, excluding self
    const categories = await Category.find({});
    const duplicate = categories.find(
      c => c._id.toString() !== req.params.categoryId &&
        normalizeCategoryName(c.name).toLowerCase() === newName.toLowerCase()
    );
    if (duplicate) {
      return res.status(409).send({ message: 'Category already exists.' });
    }

    // update all words using old category name
    await Word.updateMany({ category: category.name }, { category: newName });

    category.name = newName;
    const updated = await category.save();
    res.json(updated);
  } catch (err) { handleError(res, err); }
};

exports.delete_a_category = async (req, res) => {
  try {
    const category = await Category.findById(req.params.categoryId);
    if (!category) {
      return res.status(404).send({ message: 'Category not found' });
    }

    if (isGeneralName(category.name)) {
      return res.status(400).send({ message: 'Cannot delete General category.' });
    }

    const wordCount = await Word.countDocuments({ category: category.name });
    if (wordCount > 0) {
      return res.status(409).send({
        message: `Cannot delete. ${wordCount} word(s) are using this category.`
      });
    }

    await Category.findByIdAndDelete(req.params.categoryId);
    res.send({ message: 'Category deleted successfully', id: req.params.categoryId });
  } catch (err) { handleError(res, err); }
};
