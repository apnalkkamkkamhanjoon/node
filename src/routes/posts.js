const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { createPost, getPosts, getPost, updatePost, deletePost } = require('../controllers/postsController');
const { createComment, getComments, updateComment, deleteComment } = require('../controllers/commentController');

// 게시글 관련 라우트
router.post('/', authenticateToken, createPost);
router.get('/', getPosts);
router.get('/:id', getPost);
router.put('/:id', authenticateToken, updatePost);
router.delete('/:id', authenticateToken, deletePost);

// 댓글 관련 라우트
router.post('/:postId/comments', authenticateToken, createComment);
router.get('/:postId/comments', getComments);
router.put('/:postId/comments/:commentId', authenticateToken, updateComment);
router.delete('/:postId/comments/:commentId', authenticateToken, deleteComment);

module.exports = router;