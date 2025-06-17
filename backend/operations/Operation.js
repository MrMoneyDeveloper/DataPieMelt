class Operation {
  constructor(logger, cache) {
    this.logger = logger;
    this.cache = cache;
  }

  async run(param) {
    throw new Error('run() not implemented');
  }
}

module.exports = Operation;
