const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CategorySchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 40
  },
  isDefault: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Categories', CategorySchema);
