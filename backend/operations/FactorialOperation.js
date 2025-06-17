const path = require('path');
const Operation = require('./Operation');
const { runCommand } = require('../helpers/runCommand');
const { parseOutput } = require('../helpers/parseOutput');

class FactorialOperation extends Operation {
  constructor(logger, redisClient) {
    super(logger, redisClient);
    this.script = path.join(__dirname, '..', 'scripts', 'python', 'factorial_trace.py');
  }

  async run(param) {
    const n = Number(param) || 0;
    const { stdout } = await runCommand(`python "${this.script}" ${n}`);
    const { logs, result } = parseOutput(stdout);
    if (result !== null) {
      await this.redisClient.set(`factorial:${n}`, result.toString());
    }
    return { logs, result };
  }
}

module.exports = FactorialOperation;
