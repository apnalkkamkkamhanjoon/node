const db = require('../db');

async function createComment(req, res) {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user.userId;

    const [result] = await db.execute(
      'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
      [postId, userId, content]
    );

    res.status(201).json({ message: '댓글이 작성되었습니다.', commentId: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류' });
  }
}

async function getComments(req, res) {
  try {
    const { postId } = req.params;

    const [comments] = await db.execute(
      'SELECT comments.*, users.username FROM comments JOIN users ON comments.user_id = users.id WHERE post_id = ? ORDER BY created_at DESC',
      [postId]
    );

    res.json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류' });
  }
}

async function updateComment(req, res) {
  try {
    const { postId, commentId } = req.params;
    const { content } = req.body;
    const userId = req.user.userId;

    const [result] = await db.execute(
      'UPDATE comments SET content = ? WHERE id = ? AND post_id = ? AND user_id = ?',
      [content, commentId, postId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(403).json({ message: '댓글을 수정할 권한이 없습니다.' });
    }

    res.json({ message: '댓글이 수정되었습니다.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류' });
  }
}

async function deleteComment(req, res) {
  try {
    const { postId, commentId } = req.params;
    const userId = req.user.userId;

    const [result] = await db.execute(
      'DELETE FROM comments WHERE id = ? AND post_id = ? AND user_id = ?',
      [commentId, postId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(403).json({ message: '댓글을 삭제할 권한이 없습니다.' });
    }

    res.json({ message: '댓글이 삭제되었습니다.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류' });
  }
}

module.exports = { createComment, getComments, updateComment, deleteComment };
