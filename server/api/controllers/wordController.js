const mongoose = require('mongoose');
const Word = require('../models/wordModel');
const Category = require('../models/categoryModel');

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
    let { german, english, french, category, favourite } = req.body || {};

    german = typeof german === 'string' ? german.trim() : '';
    english = typeof english === 'string' ? english.trim() : '';
    french = typeof french === 'string' ? french.trim() : '';

    if (!german || !english || !french) {
      return res.status(400).json({ message: 'Please fill in all required language fields.' });
    }

    if (!category || !mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({ message: 'Invalid or missing category ID.' });
    }

    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ message: 'Selected category does not exist.' });
    }

    // Kiểm tra trùng từ vựng (không phân biệt hoa thường)
    const existingWord = await Word.findOne({
      german: new RegExp(`^${german}$`, 'i'),
      english: new RegExp(`^${english}$`, 'i'),
      french: new RegExp(`^${french}$`, 'i')
    });

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
      if (!mongoose.Types.ObjectId.isValid(req.body.category)) {
        return res.status(400).json({ message: 'Invalid category ID format.' });
      }
      const categoryExists = await Category.findById(req.body.category);
      if (!categoryExists) {
        return res.status(400).json({ message: 'Selected category does not exist.' });
      }
      word.category = req.body.category;
    }

    if (req.body.german !== undefined) word.german = String(req.body.german).trim();
    if (req.body.english !== undefined) word.english = String(req.body.english).trim();
    if (req.body.french !== undefined) word.french = String(req.body.french).trim();
    if (req.body.favourite !== undefined) word.favourite = Boolean(req.body.favourite);

    // Kiểm tra dữ liệu rỗng nếu có sửa ngôn ngữ
    if (!word.german || !word.english || !word.french) {
      return res.status(400).json({ message: 'Language fields cannot be empty.' });
    }

    // Kiểm tra trùng từ với từ vựng khác
    const duplicate = await Word.findOne({
      _id: { $ne: word._id },
      german: new RegExp(`^${word.german}$`, 'i'),
      english: new RegExp(`^${word.english}$`, 'i'),
      french: new RegExp(`^${word.french}$`, 'i')
    });

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
