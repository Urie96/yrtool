const transformer = require('./transformer');
const formatter = require('./formatter');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  console.log('Congratulations, your extension "yrtool" is now active!');
  transformer.activate(context);
  formatter.activate(context);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
