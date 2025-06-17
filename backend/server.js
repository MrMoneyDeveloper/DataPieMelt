const path = require('path');
const express = require('express');
const winston = require('winston');
const { createClient } = require('redis');

const requestLogger = require('./middlewares/requestLogger');
const errorHandler = require('./middlewares/errorHandler');
const OperationFactory = require('./operations/OperationFactory');

const app = express();
app.use(express.json());

// Configure Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [
    new winston.transports.File({ filename: path.join(__dirname, 'logs', 'app.log') }),
    new winston.transports.Console()
  ]
});

// Redis client for caching results
const redisClient = createClient();
redisClient.on('error', err => logger.error(`Redis error: ${err.message}`));
redisClient.connect().catch(err => logger.error(`Redis connect error: ${err.message}`));

// Request logging middleware
app.use(requestLogger(logger));

// Serve static files from output directory
app.use('/output', express.static(path.join(__dirname, 'output')));

const factory = new OperationFactory(logger, redisClient);

// API route to handle operation execution requests
app.post('/api/run', async (req, res, next) => {
  const { op, param } = req.body;
  logger.info(`Received operation request: op=${op}, param=${param}`);

  const operation = factory.create(op);
  if (!operation) {
    logger.warn(`Unknown operation requested: ${op}`);
    return res.status(400).json({ success: false, error: 'Unknown operation', logs: [] });
  }

  try {
    const result = await operation.run(param);
    logger.info(`Operation ${op} completed`);
    return res.json({ success: true, ...result });
  } catch (err) {
    logger.error(`Operation error: ${err.error ? err.error.message : err.message}`);
    if (err.stdout) {
      const { parseOutput } = require('./helpers/parseOutput');
      const { logs } = parseOutput(err.stdout);
      return res.json({ success: false, error: err.error.message, logs });
    }
    return next(err.error || err);
  }
});

// Error handling middleware
app.use(errorHandler(logger));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server listening on port ${PORT}`);
});
