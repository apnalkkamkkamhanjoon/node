const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { createPost, getPosts, getPost, updatePost, deletePost } = require('../controllers/postsController');

router.post('/', authenticateToken, createPost);
router.get('/', getPosts);
router.get('/:id', getPost);
router.put('/:id', authenticateToken, updatePost);
router.delete('/:id', authenticateToken, deletePost);

module.exports = router;
