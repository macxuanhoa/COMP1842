const mongoose = require('mongoose');
const Word = require('../models/wordModel');
const Category = require('../models/categoryModel');
const { normalizeText, exactMatch, validateLanguageFields } = require('../helpers/validation');

// Kiểm tra category ID hợp lệ và tồn tại (dùng chung cho create & update)
const validateCategoryRef = async (category) => {
  if (!category || !mongoose.Types.ObjectId.isValid(category)) {
    return 'Invalid or missing category ID.';
  }
  const categoryExists = await Category.findById(category);
  if (!categoryExists) return 'Selected category does not exist.';
  return null;
};

// Tìm từ vựng trùng cả 3 ngôn ngữ (không phân biệt hoa thường), có thể loại trừ 1 ID
const findDuplicateWord = ({ german, english, french }, excludeId) => {
  const query = {
    german: exactMatch(german),
    english: exactMatch(english),
    french: exactMatch(french)
  };
  if (excludeId) query._id = { $ne: excludeId };
  return Word.findOne(query);
};

// Lấy danh sách tất cả các từ vựng, bao gồm tên danh mục tương ứng và sắp xếp theo ngày tạo mới nhất
exports.list_all_words = async (req, res) => {
  try {
    const words = await Word.find({})
      .populate('category', 'name')
      .sort({ created_date: -1 });
    res.json(words);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load words.' });
  }
};

// Tạo một từ vựng mới với đầy đủ kiểm tra bảo mật API & Postman
exports.create_a_word = async (req, res) => {
  try {
    const { category, favourite } = req.body || {};
    const german = normalizeText((req.body || {}).german);
    const english = normalizeText((req.body || {}).english);
    const french = normalizeText((req.body || {}).french);

    const languageError = validateLanguageFields({ german, english, french });
    if (languageError) {
      return res.status(400).json({ message: languageError });
    }

    const categoryError = await validateCategoryRef(category);
    if (categoryError) {
      return res.status(400).json({ message: categoryError });
    }

    // Kiểm tra trùng từ vựng (không phân biệt hoa thường)
    const existingWord = await findDuplicateWord({ german, english, french });
    if (existingWord) {
      return res.status(400).json({ message: 'This word already exists.' });
    }

    const word = await Word.create({
      german,
      english,
      french,
      category,
      favourite: Boolean(favourite)
    });

    await word.populate('category', 'name');
    res.status(201).json(word);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Failed to create word.' });
  }
};

// Lấy chi tiết thông tin của một từ vựng theo ID
exports.read_a_word = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.wordId)) {
      return res.status(400).json({ message: 'Invalid word ID format.' });
    }

    const word = await Word.findById(req.params.wordId).populate('category', 'name');
    if (!word) return res.status(404).json({ message: 'Word not found.' });
    res.json(word);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Failed to read word.' });
  }
};

// Cập nhật thông tin từ vựng theo ID
exports.update_a_word = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.wordId)) {
      return res.status(400).json({ message: 'Invalid word ID format.' });
    }

    const word = await Word.findById(req.params.wordId);
    if (!word) return res.status(404).json({ message: 'Word not found.' });

    if (req.body.category !== undefined) {
      const categoryError = await validateCategoryRef(req.body.category);
      if (categoryError) {
        return res.status(400).json({ message: categoryError });
      }
      word.category = req.body.category;
    }

    if (req.body.german !== undefined) word.german = normalizeText(req.body.german);
    if (req.body.english !== undefined) word.english = normalizeText(req.body.english);
    if (req.body.french !== undefined) word.french = normalizeText(req.body.french);
    if (req.body.favourite !== undefined) word.favourite = Boolean(req.body.favourite);

    // Kiểm tra dữ liệu rỗng / quá dài nếu có sửa ngôn ngữ
    const languageError = validateLanguageFields(word);
    if (languageError) {
      return res.status(400).json({ message: languageError });
    }

    // Kiểm tra trùng từ với từ vựng khác
    const duplicate = await findDuplicateWord(word, word._id);
    if (duplicate) {
      return res.status(400).json({ message: 'This word already exists.' });
    }

    const updatedWord = await word.save();
    await updatedWord.populate('category', 'name');
    res.json(updatedWord);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Failed to update word.' });
  }
};

// Xóa một từ vựng khỏi cơ sở dữ liệu theo ID
exports.delete_a_word = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.wordId)) {
      return res.status(400).json({ message: 'Invalid word ID format.' });
    }

    const word = await Word.findByIdAndDelete(req.params.wordId);
    if (!word) return res.status(404).json({ message: 'Word not found.' });
    res.json({ message: 'Word deleted successfully.' });
  } catch (error) {
    res.status(400).json({ message: error.message || 'Failed to delete word.' });
  }
};
