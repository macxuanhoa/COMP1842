const Word = require('../models/wordModel');

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

    Object.assign(word, {
      german: req.body.german,
      english: req.body.english,
      french: req.body.french,
      category: req.body.category,
      favourite: req.body.favourite
    });

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

exports.delete_a_word = async (req, res) => {
  try {
    const word = await Word.findByIdAndDelete(req.params.wordId);
    if (!word) return res.status(404).json({ message: 'Word not found.' });
    res.json({ message: 'Word deleted successfully.' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
