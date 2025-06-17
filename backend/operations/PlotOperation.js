const path = require('path');
const fs = require('fs');
const Operation = require('./Operation');
const { runCommand } = require('../helpers/runCommand');
const { parseOutput } = require('../helpers/parseOutput');

class PlotOperation extends Operation {
  constructor(logger, cache) {
    super(logger, cache);
    this.script = path.join(__dirname, '..', 'scripts', 'r', 'plot_data.R');
  }

  async run(param) {
    const points = Number(param) || 0;
    const lastPoints = await this.cache.get('lastPlotPoints');
    const outputPath = path.join(__dirname, '..', 'output', 'plot_output.png');
    if (lastPoints && Number(lastPoints) === points && fs.existsSync(outputPath)) {
      this.logger.info('Reusing previously generated plot');
      return { logs: ['Using cached plot'], plotUrl: '/output/plot_output.png' };
    }

    const { stdout } = await runCommand(`Rscript "${this.script}" ${points}`);
    const { logs } = parseOutput(stdout);
    await this.cache.set('lastPlotPoints', points.toString());
    return { logs, plotUrl: '/output/plot_output.png' };
  }
}

module.exports = PlotOperation;
