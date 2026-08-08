const mongoose = require('mongoose');
const Category = require('../models/categoryModel');
const Word = require('../models/wordModel');

// Lấy danh sách tất cả danh mục, sắp xếp theo tên từ A-Z
exports.list_all_categories = async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load categories.' });
  }
};

// Tạo danh mục mới sau khi kiểm tra đầy đủ (bảo vệ Postman & API)
exports.create_a_category = async (req, res) => {
  try {
    const rawName = req.body && req.body.name;
    const name = typeof rawName === 'string' ? rawName.trim() : '';

    if (!name) {
      return res.status(400).json({ message: 'Category name is required.' });
    }
    if (name.length < 2) {
      return res.status(400).json({ message: 'Category name must be at least 2 characters.' });
    }
    if (name.length > 40) {
      return res.status(400).json({ message: 'Category name cannot exceed 40 characters.' });
    }

    const categories = await Category.find({});
    const duplicate = categories.find(category => category.name.toLowerCase() === name.toLowerCase());
    if (duplicate) return res.status(400).json({ message: 'Category already exists.' });

    const saved = await Category.create({ name });
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Failed to create category.' });
  }
};

// Cập nhật tên danh mục theo ID sau khi kiểm tra trùng tên và tính hợp lệ của ID
exports.update_a_category = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.categoryId)) {
      return res.status(400).json({ message: 'Invalid category ID format.' });
    }

    const category = await Category.findById(req.params.categoryId);
    if (!category) return res.status(404).json({ message: 'Category not found.' });

    const rawName = req.body && req.body.name;
    const newName = typeof rawName === 'string' ? rawName.trim() : '';

    if (!newName) {
      return res.status(400).json({ message: 'Category name is required.' });
    }
    if (newName.length < 2) {
      return res.status(400).json({ message: 'Category name must be at least 2 characters.' });
    }
    if (newName.length > 40) {
      return res.status(400).json({ message: 'Category name cannot exceed 40 characters.' });
    }

    const categories = await Category.find({});
    const duplicate = categories.find(c =>
      c._id.toString() !== req.params.categoryId &&
      c.name.toLowerCase() === newName.toLowerCase()
    );
    if (duplicate) return res.status(400).json({ message: 'Category already exists.' });

    category.name = newName;
    const updated = await category.save();
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Failed to update category.' });
  }
};

// Xóa danh mục theo ID (kiểm tra không cho xóa nếu còn từ vựng đang liên kết đến danh mục này)
exports.delete_a_category = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.categoryId)) {
      return res.status(400).json({ message: 'Invalid category ID format.' });
    }

    const category = await Category.findById(req.params.categoryId);
    if (!category) return res.status(404).json({ message: 'Category not found.' });

    const wordCount = await Word.countDocuments({ category: category._id });
    if (wordCount > 0) {
      return res.status(400).json({ message: 'Cannot delete a category that is currently used by words.' });
    }

    await Category.findByIdAndDelete(req.params.categoryId);
    res.json({ message: 'Category deleted successfully.' });
  } catch (error) {
    res.status(400).json({ message: error.message || 'Failed to delete category.' });
  }
};
