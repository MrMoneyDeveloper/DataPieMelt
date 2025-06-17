module.exports = (logger) => (req, res, next) => {
  logger.info(`Request: ${req.method} ${req.url}`);
  next();
};
