const Word = require('../models/wordModel');
const Category = require('../models/categoryModel');

const findDuplicateWord = async (german, english, french, excludeId) => {
  const query = { german, english, french };
  if (excludeId) query._id = { $ne: excludeId };
  return Word.findOne(query);
};

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

exports.create_a_word = async (req, res) => {
  try {
    if (!req.body.category) {
      const general = await Category.findOne({ name: 'General' });
      if (general) req.body.category = general._id;
    }

    const duplicate = await findDuplicateWord(req.body.german, req.body.english, req.body.french);
    if (duplicate) return res.status(409).json({ message: 'This word already exists.' });

    const word = await new Word(req.body).save();
    await word.populate('category', 'name');
    res.status(201).json(word);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.read_a_word = async (req, res) => {
  try {
    const word = await Word.findById(req.params.wordId).populate('category', 'name');
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

    Object.assign(word, req.body);
    const updatedWord = await word.save();
    await updatedWord.populate('category', 'name');
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
