const express = require('express');
const router = express.Router();
const wordController = require('../controllers/wordController');

// Định tuyến API cho tập hợp từ vựng: GET (lấy danh sách), POST (tạo mới)
router.route('/words')
    .get(wordController.list_all_words)
    .post(wordController.create_a_word);

// Định tuyến API cho từ vựng cụ thể theo ID: GET (xem chi tiết), PUT (cập nhật), DELETE (xóa)
router.route('/words/:wordId')
    .get(wordController.read_a_word)
    .put(wordController.update_a_word)
    .delete(wordController.delete_a_word);

// Xuất router để khai báo trong ứng dụng Express
module.exports = router;

