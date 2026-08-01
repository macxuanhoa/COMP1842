const Word = require('../models/wordModel');
const Category = require('../models/categoryModel');

// ── helpers ──────────────────────────────────────────────────────────────

const normalizeText = (value) =>
  typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';

const normalizeCategoryName = (name) =>
  typeof name === 'string' ? name.trim().replace(/\s+/g, ' ') : '';

const sameCategoryName = (firstName, secondName) =>
  normalizeCategoryName(firstName).toLowerCase() ===
  normalizeCategoryName(secondName).toLowerCase();

const buildWordData = (body) => ({
  german: normalizeText(body.german),
  english: normalizeText(body.english),
  french: normalizeText(body.french),
  category: normalizeText(body.category) || 'General',
  favourite: Boolean(body.favourite)
});

const getWordValidationError = (data) => {
  if (!data.german) return 'German word is required.';
  if (!data.english) return 'English word is required.';
  if (!data.french) return 'French word is required.';
  if (data.german.length > 80) return 'German word cannot exceed 80 characters.';
  if (data.english.length > 80) return 'English word cannot exceed 80 characters.';
  if (data.french.length > 80) return 'French word cannot exceed 80 characters.';
  if (data.category.length > 40) return 'Category name cannot exceed 40 characters.';
  return null;
};

const findDuplicateWord = async (data, excludeId = null) => {
  const query = {
    german: data.german,
    english: data.english,
    french: data.french
  };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  const duplicate = await Word.findOne(query);
  return duplicate;
};

const findOrCreateCategory = async (categoryName) => {
  const name = normalizeCategoryName(categoryName) || 'General';

  const categories = await Category.find({});
  const existingCategory = categories.find((cat) =>
    sameCategoryName(cat.name, name)
  );

  if (existingCategory) {
    return existingCategory.name;
  }

  const newCategory = await new Category({ name }).save();
  return newCategory.name;
};

// ── CRUD ─────────────────────────────────────────────────────────────────

exports.list_all_words = async (req, res) => {
  try {
    const words = await Word.find({}).sort({ created_date: -1 });
    res.json(words);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load words.' });
  }
};

exports.create_a_word = async (req, res) => {
  try {
    const wordData = buildWordData(req.body);

    const validationError = getWordValidationError(wordData);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const duplicate = await findDuplicateWord(wordData);
    if (duplicate) {
      return res.status(409).json({ message: 'This word already exists.' });
    }

    const categoryName = await findOrCreateCategory(wordData.category);
    wordData.category = categoryName;

    const word = new Word(wordData);
    const savedWord = await word.save();
    res.status(201).json(savedWord);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create word.' });
  }
};

exports.read_a_word = async (req, res) => {
  try {
    const word = await Word.findById(req.params.wordId);
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

    const wordData = buildWordData(req.body);

    const validationError = getWordValidationError(wordData);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const duplicate = await findDuplicateWord(wordData, word._id);
    if (duplicate) {
      return res.status(409).json({ message: 'This word already exists.' });
    }

    const categoryName = await findOrCreateCategory(wordData.category);

    word.german = wordData.german;
    word.english = wordData.english;
    word.french = wordData.french;
    word.category = categoryName;
    word.favourite = wordData.favourite;

    const updatedWord = await word.save();
    res.json(updatedWord);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update word.' });
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
