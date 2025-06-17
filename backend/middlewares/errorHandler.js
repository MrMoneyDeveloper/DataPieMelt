module.exports = (logger) => (err, req, res, next) => {
  logger.error(err.stack || err.message);
  res.status(500).json({ success: false, error: 'Internal server error' });
};
