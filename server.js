const express = require('express');
const cors = require('cors');

const routes = require('./routes');

const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/v1', routes);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`Reddit clone API listening on http://localhost:${PORT}`);
});
