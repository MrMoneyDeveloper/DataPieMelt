const path = require('path');
const Operation = require('./Operation');
const { runCommand } = require('../helpers/runCommand');
const { parseOutput } = require('../helpers/parseOutput');

class PlotOperation extends Operation {
  constructor(logger, redisClient) {
    super(logger, redisClient);
    this.script = path.join(__dirname, '..', 'scripts', 'r', 'plot_data.R');
  }

  async run(param) {
    const points = Number(param) || 0;
    const { stdout } = await runCommand(`Rscript "${this.script}" ${points}`);
    const { logs } = parseOutput(stdout);
    await this.redisClient.set('lastPlotPoints', points.toString());
    return { logs, plotUrl: '/output/plot_output.png' };
  }
}

module.exports = PlotOperation;
