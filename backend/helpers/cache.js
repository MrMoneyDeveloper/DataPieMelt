class Cache {
  constructor(redisClient, logger) {
    this.redisClient = redisClient;
    this.logger = logger;
    this.memory = new Map();
  }

  async get(key) {
    if (this.redisClient && this.redisClient.isReady) {
      try {
        const val = await this.redisClient.get(key);
        if (val !== null) return val;
      } catch (err) {
        this.logger.warn(`Redis get error: ${err.message}`);
      }
    }
    return this.memory.get(key) || null;
  }

  async set(key, value) {
    if (this.redisClient && this.redisClient.isReady) {
      try {
        await this.redisClient.set(key, value);
      } catch (err) {
        this.logger.warn(`Redis set error: ${err.message}`);
      }
    }
    this.memory.set(key, value);
  }
}

module.exports = Cache;
