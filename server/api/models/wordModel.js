// Mỗi document Word = 1 từ vựng 3 ngôn ngữ
// category là ObjectId → ref Categories, đảm bảo toàn vẹn tham chiếu khi đổi tên / xóa category
// favourite mặc định false — người dùng tự đánh dấu sau
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WordSchema = new Schema({
  german: {
    type: String,
    required: true,
    trim: true,
    maxlength: 80
  },
  english: {
    type: String,
    required: true,
    trim: true,
    maxlength: 80
  },
  french: {
    type: String,
    required: true,
    trim: true,
    maxlength: 80
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Categories',
    required: true
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

module.exports = mongoose.model('Words', WordSchema);
