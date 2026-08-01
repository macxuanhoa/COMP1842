// Category cực kỳ đơn giản — chỉ có name
// Không có field isDefault nữa, thay vào đó dùng logic trong controller: category tên "General" là default
// minlength:2 chặn tên 1 ký tự vô nghĩa, maxlength:40 giữ UI không bể
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CategorySchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 40
  }
});

module.exports = mongoose.model('Categories', CategorySchema);
