const { createApp } = require('./app');
const { initDb } = require('./db');

initDb({});

const app = createApp();
const port = Number(process.env.PORT || 3000);

app.listen(port, () => {
  process.stdout.write(`Server listening on http://localhost:${port}\n`);
});
