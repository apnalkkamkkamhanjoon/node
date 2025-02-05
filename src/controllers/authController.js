const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");

function generateTokens(userId) {
  const accessToken = jwt.sign(
    { userId: userId },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "30m" }
  );

  const refreshToken = jwt.sign(
    { userId: userId },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "14d" }
  );

  return { accessToken, refreshToken };
}

async function register(req, res) {
  try {
    const { username, password } = req.body;
    
    // 사용자 중복 확인
    const [existingUsers] = await db.execute(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    
    if (existingUsers.length > 0) {
      return res.status(409).json({ message: '이미 존재하는 사용자입니다.' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await db.execute(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, hashedPassword]
    );

    res.status(201).json({ message: '회원가입 성공', userId: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류' });
  }
}


async function login(req, res) {
  try {
    const { username, password } = req.body;

    const [users] = await db.execute("SELECT * FROM users WHERE username = ?", [
      username,
    ]);

    if (users.length === 0) {
      return res.status(401).json({ message: "사용자가 없음" });
    }

    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(404).json({ message: "비밀번호가 일치하지 않음" });
    }

    const { accessToken, refreshToken } = generateTokens(user.id);
    res.json({
      message: "로그인 성공",
      accessToken,
      refreshToken,
      accessTokenExp: "30m",
      refreshTokenExp: "14d",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "서버 오류" });
  }
}

async function refreshToken(req, res) {
  const { refreshToken } = req.body;
  if (!refreshToken)
    return res.status(401).json({ message: "RefreshToken이 필요합니다." });
  try {
    const user = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      user.userId
    );

    res.json({
      accessToken,
      refreshToken: newRefreshToken,
      accessTokenExp: "30m",
      refreshTokenEx: "14d",
    });
  } catch (error) {
    console.log(error);
    res.status(403).json({ message: "유효하지않은 RefreshToken입니다." });
  }
}

module.exports = { register, login, refreshToken };
