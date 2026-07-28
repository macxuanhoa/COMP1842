const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WordSchema = new Schema({
  german: {
    type: String,
    required: 'Please enter the German word',
    trim: true,
    maxlength: 80
  },
  english: {
    type: String,
    required: 'Please enter the English word',
    trim: true,
    maxlength: 80
  },
  french: {
    type: String,
    required: 'Please enter the French word',
    trim: true,
    maxlength: 80
  },
  category: {
    type: String,
    required: true,
    default: 'General',
    trim: true,
    minlength: 2,
    maxlength: 40,
    match: [/[\p{L}\p{N}]/u, 'Category name must contain a letter or number.']
  },
  favourite: {
    type: Boolean,
    default: false
  },
  created_date: {
    type: Date,
    default: Date.now
  }
});

WordSchema.index(
  { german: 1, english: 1, french: 1 },
  {
    unique: true,
    collation: { locale: 'en', strength: 2 }
  }
);

module.exports = mongoose.model('Words', WordSchema);
