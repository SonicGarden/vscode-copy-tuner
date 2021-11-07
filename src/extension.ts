import * as vscode from 'vscode';
import { CopyTunerProvider } from './CopyTunerProvider';
import { getApiKey, download, goto } from './util';

export async function activate(context: vscode.ExtensionContext) {
  const apiKey = await getApiKey();
  if (!apiKey) {
    return;
  }

  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(
      ['ruby', 'erb', 'haml', 'slim'],
      new CopyTunerProvider(apiKey),
      {
        providedCodeActionKinds: [vscode.CodeActionKind.QuickFix],
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('copyTuner.download', download)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('copyTuner.goto', () => {
      goto(apiKey);
    })
  );

  setImmediate(() => {
    const progressOptions = {
      location: vscode.ProgressLocation.Window,
      title: 'Downloading copy_tuner.yml',
    };
    vscode.window.withProgress(progressOptions, () => download(true));
  });
}

export function deactivate() {}
