const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

router.route('/categories')
    .get(categoryController.list_all_categories)
    .post(categoryController.create_a_category);

router.route('/categories/:categoryId')
    .put(categoryController.update_a_category)
    .delete(categoryController.delete_a_category);

module.exports = router;
