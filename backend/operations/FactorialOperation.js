const path = require('path');
const Operation = require('./Operation');
const { runCommand } = require('../helpers/runCommand');
const { parseOutput } = require('../helpers/parseOutput');

class FactorialOperation extends Operation {
  constructor(logger, cache) {
    super(logger, cache);
    this.script = path.join(__dirname, '..', 'scripts', 'python', 'factorial_trace.py');
  }

  async run(param) {
    const n = Number(param) || 0;
    const cacheKey = `factorial:${n}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      this.logger.info(`Cache hit for factorial ${n}`);
      return { logs: [`Using cached result for n=${n}`], result: parseInt(cached, 10) };
    }

    const { stdout } = await runCommand(`python "${this.script}" ${n}`);
    const { logs, result } = parseOutput(stdout);
    if (result !== null) {
      await this.cache.set(cacheKey, result.toString());
    }
    return { logs, result };
  }
}

module.exports = FactorialOperation;
