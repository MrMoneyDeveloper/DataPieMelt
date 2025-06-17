const FactorialOperation = require('./FactorialOperation');
const PlotOperation = require('./PlotOperation');

class OperationFactory {
  constructor(logger, redisClient) {
    this.logger = logger;
    this.redisClient = redisClient;
  }

  create(op) {
    switch (op) {
      case 'factorial':
        return new FactorialOperation(this.logger, this.redisClient);
      case 'plot':
        return new PlotOperation(this.logger, this.redisClient);
      default:
        return null;
    }
  }
}

module.exports = OperationFactory;
