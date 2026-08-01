const Category = require('../models/categoryModel');
const Word = require('../models/wordModel');

// ========== CATEGORY CRUD ==========

// GET /categories — Lấy danh sách category (default luôn đứng đầu, còn lại sắp xếp A-Z)
exports.list_all_categories = async (req, res) => {
  try {
    const categories = await Category.find({});
    categories.sort((a, b) => {
      if (a.isDefault) return -1;     // Default luôn đầu tiên
      if (b.isDefault) return 1;
      return a.name.localeCompare(b.name); // Còn lại sắp xếp alphabet
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load categories.' });
  }
};

// POST /categories — Tạo category mới (kiểm tra trùng tên không phân biệt hoa thường)
exports.create_a_category = async (req, res) => {
  try {
    const name = req.body.name;
    if (!name) return res.status(400).json({ message: 'Category name is required.' });

    // Kiểm tra trùng tên (case-insensitive)
    const categories = await Category.find({});
    const duplicate = categories.find(cat => cat.name.toLowerCase() === name.toLowerCase());
    if (duplicate) return res.status(400).json({ message: 'Category already exists.' });

    const saved = await new Category({ name }).save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PUT /categories/:categoryId — Đổi tên category (không được sửa default)
exports.update_a_category = async (req, res) => {
  try {
    const category = await Category.findById(req.params.categoryId);
    if (!category) return res.status(404).json({ message: 'Category not found.' });
    if (category.isDefault) return res.status(400).json({ message: 'Cannot edit the default category.' });

    const newName = req.body.name;
    if (!newName) return res.status(400).json({ message: 'Category name is required.' });

    // Kiểm tra trùng tên (case-insensitive, loại trừ chính nó)
    const categories = await Category.find({});
    const duplicate = categories.find(cat =>
      cat._id.toString() !== req.params.categoryId &&
      cat.name.toLowerCase() === newName.toLowerCase()
    );
    if (duplicate) return res.status(400).json({ message: 'Category already exists.' });

    // Lưu ý: KHÔNG cần update Word vì Word lưu category bằng ObjectId, không phải tên
    category.name = newName;
    const updated = await category.save();
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE /categories/:categoryId — Xóa category (chuyển các từ về default trước khi xóa)
exports.delete_a_category = async (req, res) => {
  try {
    const category = await Category.findById(req.params.categoryId);
    if (!category) return res.status(404).json({ message: 'Category not found.' });
    if (category.isDefault) return res.status(400).json({ message: 'Cannot delete the default category.' });

    // Tìm category mặc định để chuyển từ về
    const defaultCategory = await Category.findOne({ isDefault: true });
    if (!defaultCategory) return res.status(500).json({ message: 'No default category configured.' });

    // Chuyển tất cả từ đang dùng category này về default
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
