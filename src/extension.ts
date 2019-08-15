import * as vscode from "vscode";
import * as execa from "execa";
import { CopyTunerProvider } from "./CopyTunerProvider";

const getCopytunerApiKey = async () => {
  const configPaths = await vscode.workspace.findFiles(
    "config/initializers/copy_tuner.rb"
  );
  if (configPaths.length === 0) {
    return null;
  }
  const workspaceFolder = vscode.workspace.getWorkspaceFolder(
    configPaths[0]
  ) as vscode.WorkspaceFolder;

  const { stdout } = await execa(
    "bundle",
    ["exec", "rails", "runner", "puts CopyTunerClient.configuration.api_key"],
    {
      cwd: workspaceFolder.uri.path
    }
  );

  return stdout.match(/^[a-f0-9]{48}$/) ? stdout : null;
};

export async function activate(context: vscode.ExtensionContext) {
  const apiKey = await getCopytunerApiKey();
  if (!apiKey) {
    return;
  }

  const provider = vscode.languages.registerCodeActionsProvider(
    ["ruby", "erb", "haml", "slim"],
    new CopyTunerProvider(apiKey),
    {
      providedCodeActionKinds: [vscode.CodeActionKind.QuickFix]
    }
  );

  context.subscriptions.push(provider);
}

export function deactivate() {}
