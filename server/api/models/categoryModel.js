const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Định nghĩa Schema cho dữ liệu Danh mục (Categories)
const CategorySchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 40
  }
});

// Khởi tạo và xuất Mongoose Model 'Categories'
module.exports = mongoose.model('Categories', CategorySchema);

