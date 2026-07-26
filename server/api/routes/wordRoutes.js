const express = require('express');
const router = express.Router();
const wordController = require('../controllers/wordController');

router.route('/words')
    .get(wordController.list_all_words)
    .post(wordController.create_a_word);

router.route('/words/:wordId')
    .get(wordController.read_a_word)
    .put(wordController.update_a_word)
    .delete(wordController.delete_a_word);

module.exports = router;
