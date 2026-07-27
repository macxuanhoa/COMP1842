const Word = require('../models/wordModel');
const Category = require('../models/categoryModel');
const { normalizeCategoryName, getCategoryNameError } = require('../utils/categoryValidation');

// ---------- helpers ----------

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

async function checkDuplicateWord(german, english, french, excludeWordId = null) {
  const query = {
    german:   String(german   || '').trim(),
    english:  String(english  || '').trim(),
    french:   String(french   || '').trim()
  };
  if (excludeWordId) query._id = { $ne: excludeWordId };
  return Word.findOne(query);
}

// ---------- exports ----------

exports.list_all_words = async (req, res) => {
  try {
    const words = await Word.find({}).sort({ created_date: -1 });
    res.json(words);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create_a_word = async (req, res) => {
  try {
    const duplicate = await checkDuplicateWord(
      req.body.german,
      req.body.english,
      req.body.french
    );

    if (duplicate) {
      return res.status(409).json({
        message: 'This word already exists.'
      });
    }

    const categoryDoc = await findOrCreateCategory(
      req.body.category || 'General'
    );

    if (!categoryDoc) {
      return res.status(400).json({
        message: 'Invalid category name.'
      });
    }

    const newWord = new Word({
      german: req.body.german,
      english: req.body.english,
      french: req.body.french,
      category: categoryDoc.name,
      favourite: Boolean(req.body.favourite)
    });

    const savedWord = await newWord.save();
    return res.status(201).json(savedWord);
  } catch (err) {
    return res.status(400).json({
      message: err.message
    });
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
    res.status(400).json({ message: err.message });
  }
};

exports.update_a_word = async (req, res) => {
  try {
    const word = await Word.findById(req.params.wordId);
    if (!word) {
      return res.status(404).json({ message: 'Word not found' });
    }

    const duplicate = await checkDuplicateWord(
      req.body.german,
      req.body.english,
      req.body.french,
      req.params.wordId
    );

    if (duplicate) {
      return res.status(409).json({
        message: 'This word already exists.'
      });
    }

    const categoryDoc = await findOrCreateCategory(
      req.body.category || word.category || 'General'
    );

    if (!categoryDoc) {
      return res.status(400).json({ message: 'Invalid category name.' });
    }

    word.german = req.body.german;
    word.english = req.body.english;
    word.french = req.body.french;
    word.category = categoryDoc.name;
    word.favourite = Boolean(req.body.favourite);

    const updatedWord = await word.save();
    res.json(updatedWord);
  } catch (err) {
    res.status(400).json({ message: err.message });
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
    res.status(400).json({ message: err.message });
  }
};
