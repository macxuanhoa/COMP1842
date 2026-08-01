const Category = require('../models/categoryModel');
const Word = require('../models/wordModel');

exports.list_all_categories = async (req, res) => {
  try {
    const categories = await Category.find({});
    categories.sort((a, b) => {
      if (a.name === 'General') return -1;
      if (b.name === 'General') return 1;
      return a.name.localeCompare(b.name);
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load categories.' });
  }
};

exports.create_a_category = async (req, res) => {
  try {
    const name = req.body.name;
    if (!name) return res.status(400).json({ message: 'Category name is required.' });
    if (name.length < 2) return res.status(400).json({ message: 'Name must be at least 2 characters.' });

    const categories = await Category.find({});
    const duplicate = categories.find(category => category.name.toLowerCase() === name.toLowerCase());
    if (duplicate) return res.status(400).json({ message: 'Category already exists.' });

    const saved = await new Category({ name }).save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.update_a_category = async (req, res) => {
  try {
    const category = await Category.findById(req.params.categoryId);
    if (!category) return res.status(404).json({ message: 'Category not found.' });
    if (category.name === 'General') return res.status(400).json({ message: 'Cannot edit the default category.' });

    const newName = req.body.name;
    if (!newName) return res.status(400).json({ message: 'Category name is required.' });
    if (newName.length < 2) return res.status(400).json({ message: 'Name must be at least 2 characters.' });

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
    res.status(400).json({ message: error.message });
  }
};

exports.delete_a_category = async (req, res) => {
  try {
    const category = await Category.findById(req.params.categoryId);
    if (!category) return res.status(404).json({ message: 'Category not found.' });
    if (category.name === 'General') return res.status(400).json({ message: 'Cannot delete the default category.' });

    const defaultCategory = await Category.findOne({ name: 'General' });
    if (!defaultCategory) return res.status(500).json({ message: 'No default category configured.' });

    await Word.updateMany(
      { category: category._id },
      { category: defaultCategory._id }
    );

    await Category.findByIdAndDelete(req.params.categoryId);
    res.json({ message: 'Category deleted successfully.' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
