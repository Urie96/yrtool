const { window } = require('vscode');

const channel = window.createOutputChannel('yrtool');

module.exports = {
  log: (data) => channel.appendLine(`${data}`),
  logError: (data) => channel.appendLine(`[error] ${data}`),
};
