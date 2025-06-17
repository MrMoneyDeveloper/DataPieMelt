/**
 * Parse script output lines, separating logs and result.
 * The result is the last line if it's a number.
 * @param {string} output
 * @returns {{ logs: string[], result: number|null }}
 */
function parseOutput(output) {
  if (!output) return { logs: [], result: null };
  const lines = output.trim().split(/\r?\n/);
  let result = null;
  const last = lines[lines.length - 1];
  if (/^-?\d+$/.test(last)) {
    result = parseInt(last, 10);
    lines.pop();
  }
  return { logs: lines, result };
}

module.exports = { parseOutput };
