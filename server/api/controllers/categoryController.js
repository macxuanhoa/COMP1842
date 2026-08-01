const Category = require('../models/categoryModel');
const Word = require('../models/wordModel');

exports.list_all_categories = async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load categories.' });
  }
};

exports.create_a_category = async (req, res) => {
  try {
    const name = req.body.name;

    const categories = await Category.find({});
    const duplicate = categories.find(category => category.name.toLowerCase() === name.toLowerCase());
    if (duplicate) return res.status(400).json({ message: 'Category already exists.' });

    const saved = await Category.create({ name });
    res.status(201).json(saved);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Category name must be at least 2 characters.' });
    }
    res.status(400).json({ message: error.message });
  }
};

exports.update_a_category = async (req, res) => {
  try {
    const category = await Category.findById(req.params.categoryId);
    if (!category) return res.status(404).json({ message: 'Category not found.' });

    const newName = req.body.name;

    const categories = await Category.find({});
    const duplicate = categories.find(category =>
      category._id.toString() !== req.params.categoryId &&
      category.name.toLowerCase() === newName.toLowerCase()
    );
    if (duplicate) return res.status(400).json({ message: 'Category already exists.' });

    category.name = newName;
    const updated = await category.save();
    res.json(updated);
  } catch (error) {
      if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Category name must be at least 2 characters.' });
    }
    res.status(400).json({ message: error.message });
  }
};

exports.delete_a_category = async (req, res) => {
  try {
    const category = await Category.findById(req.params.categoryId);
    if (!category) return res.status(404).json({ message: 'Category not found.' });

    const wordCount = await Word.countDocuments({ category: category._id });
    if (wordCount > 0) {
      return res.status(400).json({ message: 'Cannot delete a category that is currently used by words.' });
    }

    await Category.findByIdAndDelete(req.params.categoryId);
    res.json({ message: 'Category deleted successfully.' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
