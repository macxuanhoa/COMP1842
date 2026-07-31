const Word = require('../models/wordModel');

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
    const wordData = {
      ...req.body,
      category: (req.body.category || '').trim() || 'General'
    };
    const word = new Word(wordData);
    const savedWord = await word.save();
    res.status(201).json(savedWord);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'This word already exists.' });
    }
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

    word.german = req.body.german;
    word.english = req.body.english;
    word.french = req.body.french;
    word.category = (req.body.category || '').trim() || 'General';
    word.favourite = req.body.favourite;

    const updatedWord = await word.save();
    res.json(updatedWord);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'This word already exists.' });
    }
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
