const express = require('express');
const authRoutes = require('./routes/auth');
const postsRoutes = require('./routes/posts');
const cors = require('cors');
const winston = require('winston');
const morgan = require('morgan');
require('dotenv').config();

// Winston 로거 설정
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

const app = express();

// Morgan 미들웨어 설정 (HTTP 요청 로깅)
app.use(morgan('dev'));

app.use(express.json());
const corsOptions = {
  origin: ['http://192.168.0.208', 'http://localhost:5173'],
  credentials: true,
};

app.use(cors(corsOptions));

// 요청 로깅 미들웨어
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

app.use('/auth', authRoutes);
app.use('/posts', postsRoutes);

// 에러 핸들링 미들웨어
app.use((err, req, res, next) => {
  logger.error(`Error: ${err.message}`);
  logger.error(err.stack);
  res.status(500).send('서버 에러 발생');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});

// 전역 에러 핸들링
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});