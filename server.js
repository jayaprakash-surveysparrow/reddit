const express = require('express');
const {rateLimit} = require('./rateLimit/rateLimitMiddleware');
const cors = require('cors');

const routes = require('./routes');
const requestLogger = require('./middleware/requestLogger');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3000;

const app = express();

app.set('trust proxy', 1);
app.use(requestLogger);
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use(rateLimit('global'));
app.use('/api/v1', routes);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  logger.info(`Reddit clone API listening on http://localhost:${PORT}`);
});
