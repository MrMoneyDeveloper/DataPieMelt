const FactorialOperation = require('./FactorialOperation');
const PlotOperation = require('./PlotOperation');

class OperationFactory {
  constructor(logger, cache) {
    this.logger = logger;
    this.cache = cache;
  }

  create(op) {
    switch (op) {
      case 'factorial':
        return new FactorialOperation(this.logger, this.cache);
      case 'plot':
        return new PlotOperation(this.logger, this.cache);
      default:
        return null;
    }
  }
}

module.exports = OperationFactory;
