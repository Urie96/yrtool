const JSONbig = require('json-bigint');
const vscode = require('vscode');

const formatJSON = (json) => JSONbig.stringify(JSONbig.parse(json), null, 4);
const minifyJSON = (json) => JSONbig.stringify(JSONbig.parse(json));

function replaceSelection(textEditor, callback) {
  const selectText = textEditor.document.getText(textEditor.selection);
  if (selectText) {
    textEditor.edit((builder) => {
      try {
        builder.replace(textEditor.selection, callback(selectText));
      } catch (e) {
        vscode.window.showErrorMessage(e.message);
      }
    });
  } else {
    vscode.window.showWarningMessage('无选中文本!');
  }
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand(
      'yrtool.stringify',
      (textEditor) => {
        replaceSelection(textEditor, (old) => JSON.stringify(old));
      }
    ),
    vscode.commands.registerTextEditorCommand(
      'yrtool.unstringify',
      (textEditor) => {
        replaceSelection(textEditor, (old) => {
          if (!old.startsWith(`"`) || !old.endsWith(`"`)) {
            vscode.window.showErrorMessage('中断：选中的文本没有被双引号包裹');
            return old;
          }
          return JSON.parse(old);
        });
      }
    ),
    vscode.commands.registerTextEditorCommand(
      'yrtool.minifyJSON',
      (textEditor) => {
        replaceSelection(textEditor, (old) => minifyJSON(old));
      }
    ),
    vscode.commands.registerTextEditorCommand(
      'yrtool.formatJSON',
      (textEditor) => {
        replaceSelection(textEditor, (old) => formatJSON(old));
      }
    ),
    vscode.commands.registerTextEditorCommand(
      'yrtool.encodeBase64',
      (textEditor) => {
        replaceSelection(textEditor, (old) =>
          Buffer.from(old).toString('base64')
        );
      }
    ),
    vscode.commands.registerTextEditorCommand(
      'yrtool.decodeBase64',
      (textEditor) => {
        replaceSelection(textEditor, (old) =>
          Buffer.from(old, 'base64').toString()
        );
      }
    ),
    vscode.commands.registerTextEditorCommand(
      'yrtool.copyPathLine',
      (textEditor) => {
        const relativePath = vscode.workspace.asRelativePath(
          textEditor.document.uri
        );
        const line = textEditor.selection.anchor.line + 1;
        console.log(`${relativePath}:${line}`);
        vscode.env.clipboard.writeText(`${relativePath}:${line}`);
      }
    )
  );
}

module.exports = {
  activate,
};
