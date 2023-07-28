const { window } = require('vscode');
const execa = require('execa');
const { log, logError } = require('../log');

/**
 * @param {string} text
 * @param {string} command
 * @param {Array<string>} args
 * @param {string} filename
 * @param {string} language
 * @param {string} workspacePath
 *
 * @return {Promise<string>}
 */
module.exports.runCommand = async (
  text,
  command,
  args,
  filename,
  language,
  workspacePath
) => {
  if (!command) return text;

  const errorOut = (error) => {
    const errorMsg = `Received an error while running the following format command on ${filename}:\n> ${command}\nError:\n> ${error}`;
    logError(errorMsg);
    window.showInformationMessage(errorMsg);
  };

  const startMs = Date.now();

  try {
    const realArgs = args.map((arg) =>
      arg.replace('$FILENAME', filename).replace('$LANGUAGE', language)
    );
    const commandString = `${command} ${realArgs.join(' ')}`;
    log(`executing: ${commandString}`);
    const { stdout, stderr } = await execa(command, realArgs, {
      input: text,
      cwd: workspacePath,
    });

    if (stderr.length) errorOut(stderr);

    if (stdout.length) {
      log(
        `Formatted ${filename} in ${
          Date.now() - startMs
        }ms using the following command:\n> ${commandString}`
      );
      return stdout;
    }

    log(`Skipping ${filename}`);
    return text;
  } catch (e) {
    errorOut(`${e.shortMessage}\n${e.stderr}`);
    return text;
  }
};
