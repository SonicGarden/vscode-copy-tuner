import * as vscode from "vscode";
import * as execa from "execa";
import { CopyTunerProvider } from "./CopyTunerProvider";
import { getApiKey, download } from "./util";

export async function activate(context: vscode.ExtensionContext) {
  const apiKey = await getApiKey();
  if (!apiKey) {
    return;
  }

  const codeActionProvider = vscode.languages.registerCodeActionsProvider(
    ["ruby", "erb", "haml", "slim"],
    new CopyTunerProvider(apiKey),
    {
      providedCodeActionKinds: [vscode.CodeActionKind.QuickFix]
    }
  );

  const command = vscode.commands.registerCommand(
    "copyTuner.download",
    download
  );

  setImmediate(() => {
    const progressOptions = {
      location: vscode.ProgressLocation.Window,
      title: "Downloading copy_tuner.yml"
    };
    vscode.window.withProgress(progressOptions, () => download(true));
  });

  context.subscriptions.push(codeActionProvider, command);
}

export function deactivate() {}
