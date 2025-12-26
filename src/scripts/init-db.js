require('dotenv').config();

const { initDb } = require('../lib/db');

initDb({});
process.stdout.write('Database initialized.\n');
