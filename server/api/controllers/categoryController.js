const Category = require('../models/categoryModel');
const Word = require('../models/wordModel');

function isGeneral(name) {
  return (name || '').trim().toLowerCase() === 'general';
}

exports.list_all_categories = async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load categories.' });
  }
};

exports.create_a_category = async (req, res) => {
  try {
    const name = (req.body.name || '').trim();
    if (!name) {
      return res.status(400).json({ message: 'Category name is required.' });
    }

    if (isGeneral(name)) {
      return res.status(400).json({ message: 'General is a protected category.' });
    }

    const existing = await Category.findOne({ name });
    if (existing) {
      return res.status(409).json({ message: 'Category already exists.' });
    }

    const newCategory = new Category({ name });
    const saved = await newCategory.save();
    res.status(201).json(saved);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        message:
          err.errors?.name?.message ||
          'Category name must be 2-40 characters.'
      });
    }
    console.error(err);
    return res.status(500).json({
      message: 'Failed to create category.'
    });
  }
};

exports.update_a_category = async (req, res) => {
  try {
    const category = await Category.findById(req.params.categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    if (isGeneral(category.name)) {
      return res.status(400).json({ message: 'Cannot edit General category.' });
    }

    const newName = (req.body.name || '').trim();
    if (!newName) {
      return res.status(400).json({ message: 'Category name is required.' });
    }

    if (isGeneral(newName)) {
      return res.status(400).json({ message: 'General is a protected category.' });
    }

    const duplicate = await Category.findOne({ name: newName });
    if (duplicate && duplicate._id.toString() !== req.params.categoryId) {
      return res.status(409).json({ message: 'Category already exists.' });
    }

    await Word.updateMany({ category: category.name }, { category: newName });

    category.name = newName;
    const updated = await category.save();
    res.json(updated);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        message:
          err.errors?.name?.message ||
          'Category name must be 2-40 characters.'
      });
    }
    console.error(err);
    return res.status(500).json({
      message: 'Failed to update category.'
    });
  }
};

exports.delete_a_category = async (req, res) => {
  try {
    const category = await Category.findById(req.params.categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    if (isGeneral(category.name)) {
      return res.status(400).json({ message: 'Cannot delete General category.' });
    }

    const wordCount = await Word.countDocuments({ category: category.name });
    if (wordCount > 0) {
      return res.status(409).json({
        message: `Cannot delete. ${wordCount} word(s) are using this category.`
      });
    }

    await Category.findByIdAndDelete(req.params.categoryId);
    res.json({ message: 'Category deleted successfully.' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
