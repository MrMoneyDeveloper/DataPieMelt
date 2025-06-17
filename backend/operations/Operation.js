class Operation {
  constructor(logger, redisClient) {
    this.logger = logger;
    this.redisClient = redisClient;
  }

  async run(param) {
    throw new Error('run() not implemented');
  }
}

module.exports = Operation;
