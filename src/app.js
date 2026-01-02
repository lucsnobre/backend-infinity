require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const v1Routes = require('./routes/v1');
const deezerRoutes = require('./routes/deezer');

function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '1mb' }));
  app.use(morgan('dev'));

  app.get('/health', (req, res) => res.json({ ok: true }));

  app.use('/deezer-api', deezerRoutes);
  app.use('/v1', v1Routes);

  app.use((err, req, res, next) => {
    const status = err.statusCode || 500;
    return res.status(status).json({ error: err.code || 'internal_error' });
  });

  return app;
}

module.exports = { createApp };
