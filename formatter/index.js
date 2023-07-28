const {
  workspace,
  window,
  languages,
  TextEdit,
  Uri,
  commands,
  TextDocument,
  ExtensionContext,
  Range,
  Position,
} = require('vscode');
const { log } = require('../log');
const { runCommand } = require('./run-command');
const { dirname } = require('path');

/**
 * @typedef {Object} Formatter
 * @property {Array<string>} languages
 * @property {string} command
 * @property {Array<string>} args
 */

/**
 * @param {ExtensionContext} context
 */
module.exports.activate = (context) => {
  createFormatters();
  workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration('yrtool.formatters')) {
      context.subscriptions.forEach((disposable) => disposable.dispose());
      log(
        `Detected a change in the 'yrtool.formatters' configuration.  Reactivating formatters...`
      );
      createFormatters();
    }
  });

  function createFormatters() {
    const config = workspace.getConfiguration('yrtool');

    /** @type {Formatter[]} */
    const formatters = config.get('formatters');

    if (!formatters) return;

    /** @type {string[]} */
    const listeningLanguages = [];

    for (const formatter of formatters) {
      if (!formatter.command || !formatter.languages.length) {
        window
          .showErrorMessage(
            'Invalid formatter configuration in the `yrtool.formatters` setting.',
            'Visit Docs'
          )
          .then((clicked) => {
            log(clicked);
            commands.executeCommand('vscode.open', Uri.parse());
          });
        break;
      }

      const disposable = languages.registerDocumentFormattingEditProvider(
        formatter.languages,
        {
          /**
           * @param {TextDocument} document
           * @return {Promise<TextEdit[]>}
           */
          async provideDocumentFormattingEdits(document) {
            const rawText = document.getText();
            const filename = document.uri.fsPath;
            const language = document.languageId;
            const workspaceDir = getCwd(filename);
            const formattedText = await runCommand(
              rawText,
              formatter.command,
              formatter.args,
              filename,
              language,
              workspaceDir
            );

            const lastLineNumber = document.lineCount - 1;
            const lastLineChar = document.lineAt(lastLineNumber).text.length;

            const startPos = new Position(0, 0);
            const endPos = new Position(lastLineNumber, lastLineChar);
            const replaceRange = new Range(startPos, endPos);

            return [TextEdit.replace(replaceRange, formattedText)];
          },
        }
      );

      listeningLanguages.push(...formatter.languages);

      context.subscriptions.push(disposable);
    }

    log(
      `Formatting activated for the following languages: [${listeningLanguages.toLocaleString()}]`
    );
  }
};

/**
 * @param {string} filepath
 * @return {string}
 */
function getCwd(filepath) {
  const workspaceFolder = workspace.getWorkspaceFolder(Uri.parse(filepath));
  if (!workspaceFolder) {
    const dir = dirname(filepath);
    log(
      `File to format is not in a workspace.  Guessing that the format command's intended \`PWD\` is the dirname of the file (${dir}).`
    );
    return dir;
  }

  return workspaceFolder.uri.path;
}
