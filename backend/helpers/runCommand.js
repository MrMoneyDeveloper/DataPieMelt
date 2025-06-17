const { exec } = require('child_process');

/**
 * Execute a shell command and capture stdout/stderr.
 * @param {string} cmd
 * @returns {Promise<{ stdout: string, stderr: string }>}
 */
function runCommand(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        return reject({ error, stdout, stderr });
      }
      resolve({ stdout, stderr });
    });
  });
}

module.exports = { runCommand };
