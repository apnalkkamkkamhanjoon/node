const db = require('../db');

async function createPost(req, res) {
  try {
    const { title, content } = req.body;
    const userId = req.user.userId;

    const [result] = await db.execute(
      'INSERT INTO posts (title, content, user_id) VALUES (?, ?, ?)',
      [title, content, userId]
    );

    res.status(201).json({ message: '게시글이 작성되었습니다.', postId: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류' });
  }
}

async function getPosts(req, res) {
  try {
    const [posts] = await db.execute(
      'SELECT posts.id, posts.title, posts.content, posts.created_at, users.username AS author FROM posts JOIN users ON posts.user_id = users.id ORDER BY posts.created_at DESC'
    );

    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류' });
  }
}

async function getPost(req, res) {
  try {
    const { id } = req.params;

    const [posts] = await db.execute(
      'SELECT posts.id, posts.title, posts.content, posts.created_at, users.username AS author FROM posts JOIN users ON posts.user_id = users.id WHERE posts.id = ?',
      [id]
    );

    if (posts.length === 0) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }

    res.json(posts[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류' });
  }
}

async function updatePost(req, res) {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const userId = req.user.userId;

    const [posts] = await db.execute('SELECT * FROM posts WHERE id = ? AND user_id = ?', [id, userId]);

    if (posts.length === 0) {
      return res.status(403).json({ message: '수정 권한이 없습니다.' });
    }

    await db.execute('UPDATE posts SET title = ?, content = ? WHERE id = ?', [title, content, id]);

    res.json({ message: '게시글이 수정되었습니다.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류' });
  }
}

async function deletePost(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const [posts] = await db.execute('SELECT * FROM posts WHERE id = ? AND user_id = ?', [id, userId]);

    if (posts.length === 0) {
      return res.status(403).json({ message: '삭제 권한이 없습니다.' });
    }

    await db.execute('DELETE FROM posts WHERE id = ?', [id]);

    res.json({ message: '게시글이 삭제되었습니다.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류' });
  }
}

module.exports = { createPost, getPosts, getPost, updatePost, deletePost };
