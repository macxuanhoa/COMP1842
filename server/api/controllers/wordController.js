const Word = require('../models/wordModel');
const Category = require('../models/categoryModel');
const { normalizeCategoryName } = require('../utils/categoryValidation');

async function ensureCategoryExists(rawName) {
  const name = normalizeCategoryName(rawName);
  if (!name) return;
  await Category.findOneAndUpdate(
    { name },
    { $setOnInsert: { name } },
    { upsert: true }
  ).collation({ locale: 'en', strength: 2 });
}

function handleError(res, err) {
  if (err.name === 'ValidationError' || err.name === 'CastError') {
    return res.status(400).json({ message: err.message });
  }
  if (err.code === 11000) {
    return res.status(409).json({ message: 'This word already exists.' });
  }
  console.error(err);
  return res.status(500).json({ message: 'Unexpected error' });
}

exports.list_all_words = async (req, res) => {
  try {
    const words = await Word.find({}).sort({ created_date: -1 });
    res.json(words);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unexpected error' });
  }
};

exports.create_a_word = async (req, res) => {
  try {
    const newWord = new Word(req.body);
    const savedWord = await newWord.save();
    await ensureCategoryExists(savedWord.category);
    res.status(201).json(savedWord);
  } catch (err) {
    handleError(res, err);
  }
};

exports.read_a_word = async (req, res) => {
  try {
    const word = await Word.findById(req.params.wordId);
    if (!word) {
      return res.status(404).json({ message: 'Word not found' });
    }
    res.json(word);
  } catch (err) {
    handleError(res, err);
  }
};

exports.update_a_word = async (req, res) => {
  try {
    const word = await Word.findById(req.params.wordId);
    if (!word) {
      return res.status(404).json({ message: 'Word not found' });
    }
    Object.assign(word, req.body);
    const updatedWord = await word.save();
    await ensureCategoryExists(updatedWord.category);
    res.json(updatedWord);
  } catch (err) {
    handleError(res, err);
  }
};

exports.delete_a_word = async (req, res) => {
  try {
    const word = await Word.findByIdAndDelete(req.params.wordId);
    if (!word) {
      return res.status(404).json({ message: 'Word not found' });
    }
    res.json({ message: 'Word deleted successfully', id: req.params.wordId });
  } catch (err) {
    handleError(res, err);
  }
};
