require('dotenv').config();

const { initDb } = require('../db');

initDb({});
process.stdout.write('Database initialized.\n');
