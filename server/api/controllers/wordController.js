const Word = require('../models/wordModel');
const Category = require('../models/categoryModel');

const findDuplicateWord = async (german, english, french, excludeId) => {
  const query = { german, english, french };
  if (excludeId) query._id = { $ne: excludeId };
  return Word.findOne(query);
};

// ── CRUD ─────────────────────────────────────────────────────────────

exports.list_all_words = async (req, res) => {
  try {
    const words = await Word.find({})
      .populate('category', 'name isDefault')
      .sort({ created_date: -1 });
    res.json(words);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load words.' });
  }
};

exports.create_a_word = async (req, res) => {
  try {
    const { german, english, french, category } = req.body;

    // use default category if none provided
    if (!category) {
      const defaultCat = await Category.findOne({ isDefault: true });
      if (!defaultCat) return res.status(500).json({ message: 'No default category configured.' });
      req.body.category = defaultCat._id;
    }

    const duplicate = await findDuplicateWord(german, english, french);
    if (duplicate) return res.status(409).json({ message: 'This word already exists.' });

    const word = await new Word(req.body).save();
    await word.populate('category', 'name isDefault');
    res.status(201).json(word);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.read_a_word = async (req, res) => {
  try {
    const word = await Word.findById(req.params.wordId)
      .populate('category', 'name isDefault');
    if (!word) return res.status(404).json({ message: 'Word not found.' });
    res.json(word);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.update_a_word = async (req, res) => {
  try {
    const word = await Word.findById(req.params.wordId);
    if (!word) return res.status(404).json({ message: 'Word not found.' });

    const duplicate = await findDuplicateWord(
      req.body.german || word.german,
      req.body.english || word.english,
      req.body.french || word.french,
      word._id
    );
    if (duplicate) return res.status(409).json({ message: 'This word already exists.' });

    if (req.body.german) word.german = req.body.german;
    if (req.body.english) word.english = req.body.english;
    if (req.body.french) word.french = req.body.french;
    if (req.body.category) word.category = req.body.category;
    if (req.body.favourite !== undefined) word.favourite = req.body.favourite;

    const updatedWord = await word.save();
    await updatedWord.populate('category', 'name isDefault');
    res.json(updatedWord);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.delete_a_word = async (req, res) => {
  try {
    const word = await Word.findByIdAndDelete(req.params.wordId);
    if (!word) return res.status(404).json({ message: 'Word not found.' });
    res.json({ message: 'Word deleted successfully.' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
