const Word = require('../models/wordModel');
const Category = require('../models/categoryModel');
const { normalizeCategoryName, getCategoryNameError } = require('../utils/categoryValidation');

// ---------- helpers ----------

function buildWordData(body) {
  return {
    german: typeof body.german === 'string' ? body.german.trim() : '',
    english: typeof body.english === 'string' ? body.english.trim() : '',
    french: typeof body.french === 'string' ? body.french.trim() : '',
    category: typeof body.category === 'string' ? body.category.trim() : 'General',
    favourite: Boolean(body.favourite)
  };
}

function getWordValidationError(data) {
  if (!data.german) return 'German word is required.';
  if (!data.english) return 'English word is required.';
  if (!data.french) return 'French word is required.';

  if (data.german.length > 80 || data.english.length > 80 || data.french.length > 80) {
    return 'Maximum length is 80 characters.';
  }

  const catName = normalizeCategoryName(data.category);
  return getCategoryNameError(catName) || '';
}

async function findOrCreateCategory(categoryName) {
  const normalized = normalizeCategoryName(categoryName);
  const catError = getCategoryNameError(normalized);
  if (catError) return null;

  const categories = await Category.find({});
  const match = categories.find(
    c => normalizeCategoryName(c.name).toLowerCase() === normalized.toLowerCase()
  );

  if (match) return match;

  const newCat = new Category({ name: normalized });
  return newCat.save();
}

// ---------- exports ----------

exports.list_all_words = async (req, res) => {
  try {
    const words = await Word.find({}).sort({ created_date: -1 });
    res.json(words);
  } catch (err) {
    res.status(500).send({ message: 'Unexpected error' });
  }
};

exports.create_a_word = async (req, res) => {
  try {
    const data = buildWordData(req.body);

    const validationErr = getWordValidationError(data);
    if (validationErr) {
      return res.status(400).send({ message: validationErr });
    }

    // duplicate check
    const duplicate = await Word.findOne({
      german: data.german,
      english: data.english,
      french: data.french
    });
    if (duplicate) {
      return res.status(409).send({ message: 'This word already exists.' });
    }

    // resolve category
    const categoryDoc = await findOrCreateCategory(data.category);
    if (!categoryDoc) {
      return res.status(400).send({ message: 'Invalid category name.' });
    }

    const newWord = new Word({
      german: data.german,
      english: data.english,
      french: data.french,
      category: categoryDoc.name,
      favourite: data.favourite
    });

    const saved = await newWord.save();
    res.status(201).json(saved);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).send({ message: err.message });
    }
    res.status(500).send({ message: 'Unexpected error' });
  }
};

exports.read_a_word = async (req, res) => {
  try {
    const word = await Word.findById(req.params.wordId);
    if (!word) {
      return res.status(404).send({ message: 'Word not found' });
    }
    res.json(word);
  } catch (err) {
    res.status(500).send({ message: 'Unexpected error' });
  }
};

exports.update_a_word = async (req, res) => {
  try {
    const word = await Word.findById(req.params.wordId);
    if (!word) {
      return res.status(404).send({ message: 'Word not found' });
    }

    const data = buildWordData(req.body);

    const validationErr = getWordValidationError(data);
    if (validationErr) {
      return res.status(400).send({ message: validationErr });
    }

    // duplicate check, excluding current word
    const duplicate = await Word.findOne({
      german: data.german,
      english: data.english,
      french: data.french,
      _id: { $ne: req.params.wordId }
    });
    if (duplicate) {
      return res.status(409).send({ message: 'This word already exists.' });
    }

    // resolve category
    const categoryDoc = await findOrCreateCategory(data.category);
    if (!categoryDoc) {
      return res.status(400).send({ message: 'Invalid category name.' });
    }

    word.german = data.german;
    word.english = data.english;
    word.french = data.french;
    word.category = categoryDoc.name;
    word.favourite = data.favourite;

    const updated = await word.save();
    res.json(updated);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).send({ message: err.message });
    }
    res.status(500).send({ message: 'Unexpected error' });
  }
};

exports.delete_a_word = async (req, res) => {
  try {
    const word = await Word.findByIdAndDelete(req.params.wordId);
    if (!word) {
      return res.status(404).send({ message: 'Word not found' });
    }
    res.send({ message: 'Word deleted successfully', id: req.params.wordId });
  } catch (err) {
    res.status(500).send({ message: 'Unexpected error' });
  }
};
