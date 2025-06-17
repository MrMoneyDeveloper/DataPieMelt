module.exports = (logger) => (req, res, next) => {
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const duration = Number(process.hrtime.bigint() - start) / 1e6;
    logger.info(`HTTP ${req.method} ${req.originalUrl} ${res.statusCode} ${duration.toFixed(2)}ms`);
  });
  next();
};
