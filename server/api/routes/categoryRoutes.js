const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// Định tuyến API cho danh mục: GET (lấy danh sách), POST (tạo mới)
router.route('/categories')
    .get(categoryController.list_all_categories)
    .post(categoryController.create_a_category);

// Định tuyến API cho danh mục cụ thể theo ID: PUT (cập nhật), DELETE (xóa)
router.route('/categories/:categoryId')
    .put(categoryController.update_a_category)
    .delete(categoryController.delete_a_category);

// Xuất router để khai báo trong ứng dụng Express
module.exports = router;

