require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const catalogRoutes = require('./routes/catalog');
const socialRoutes = require('./routes/social');
const badgeRoutes = require('./routes/badges');
const aiRoutes = require('./routes/ai');

function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '1mb' }));
  app.use(morgan('dev'));

  app.get('/health', (req, res) => res.json({ ok: true }));

  app.use('/auth', authRoutes);
  app.use('/users', userRoutes);
  app.use('/catalog', catalogRoutes);
  app.use('/social', socialRoutes);
  app.use('/badges', badgeRoutes);
  app.use('/ai', aiRoutes);

  app.use((err, req, res, next) => {
    const status = err.statusCode || 500;
    return res.status(status).json({ error: err.code || 'internal_error' });
  });

  return app;
}

module.exports = { createApp };
