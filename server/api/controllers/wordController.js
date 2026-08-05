const Word = require('../models/wordModel');

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

// Tạo một từ vựng mới với thông tin tiếng Đức, Anh, Pháp, danh mục và trạng thái yêu thích
exports.create_a_word = async (req, res) => {
  try {
    const { german, english, french, category, favourite } = req.body;

    const word = await Word.create({
      german, english, french, category,
      favourite: Boolean(favourite)
    });
    await word.populate('category', 'name');
    res.status(201).json(word);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'This word already exists.' });
    }
    res.status(400).json({ message: error.message });
  }
};

// Lấy chi tiết thông tin của một từ vựng theo ID
exports.read_a_word = async (req, res) => {
  try {
    const word = await Word.findById(req.params.wordId).populate('category', 'name');
    if (!word) return res.status(404).json({ message: 'Word not found.' });
    res.json(word);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Cập nhật thông tin từ vựng theo ID
exports.update_a_word = async (req, res) => {
  try {
    const word = await Word.findById(req.params.wordId);
    if (!word) return res.status(404).json({ message: 'Word not found.' });

    word.german = req.body.german;
    word.english = req.body.english;
    word.french = req.body.french;
    word.category = req.body.category;
    word.favourite = req.body.favourite;

    const updatedWord = await word.save();
    await updatedWord.populate('category', 'name');
    res.json(updatedWord);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'This word already exists.' });
    }
    res.status(400).json({ message: error.message });
  }
};

// Xóa một từ vựng khỏi cơ sở dữ liệu theo ID
exports.delete_a_word = async (req, res) => {
  try {
    const word = await Word.findByIdAndDelete(req.params.wordId);
    if (!word) return res.status(404).json({ message: 'Word not found.' });
    res.json({ message: 'Word deleted successfully.' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

