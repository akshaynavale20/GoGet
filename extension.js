// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
const cp = require("child_process");
var items = [];
var errOccuredCount = 0;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated

  vscode.window.showInformationMessage(
    "Scanning and Downloading Repos in Background !"
  );
  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "GoGet.helloWorld",
    async function () {
      const files = await vscode.workspace.findFiles(
        "**/*.go*",
        "**/node_modules/**"
      );
      files.forEach((file) => {
        fs.readFile(file.fsPath, function read(err, data) {
          if (err) {
            throw err;
          }
          const content = data;

          processFile(content);
        });

        if (errOccuredCount > 0) {
          vscode.window.showInformationMessage(
            "I am still in devolopement mode :( some repos not downloaded ErrCount:" +
              errOccuredCount
          );
        } else {
          vscode.window.showInformationMessage(
            "Github Repos Scanned Succesfully ! "
          );
        }
      });
    }
  );

  context.subscriptions.push(disposable);
}

function processFile(content) {
  var contentString = content.toString("utf8").split("\n");
  let folderPath = vscode.workspace.rootPath;
  var parentDirPath = path.resolve(folderPath, "..", "..").trim();
  for (var i = 0; i < contentString.length; i++) {
    // console.log("Line: " + contentString[i] + "Include: " + contentString[i].includes("github"))
    if (contentString[i].includes("github") === true) {
      var githubFolders = contentString[i].trim();
      var matches = githubFolders.match(/\"(.*?)\"/);

      var checkPath = parentDirPath + "/src/" + matches[1].trim();

      if (
        fs.existsSync(checkPath) === false &&
        items.indexOf(matches[1].trim()) === -1
      ) {
        if (items.indexOf(matches[1].trim()) === -1) {
          items.push(matches[1].trim());
        }

        cp.exec("go get " + contentString[i].trim(), (err) => {
          if (err) {
            errOccuredCount++;
          }
        });
      }
    }
  }
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
