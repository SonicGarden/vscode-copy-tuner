import {
  workspace,
  window,
  WorkspaceEdit,
  Uri,
  extensions,
  QuickPickItem,
  Range,
  commands,
} from 'vscode';
import * as childProcess from 'child_process';
import {promisify} from 'util';

const exec = promisify(childProcess.exec);

export type Translation = {
  locale: string
  path: string
  value: string
  range: Range
};

const getWorkspaceFolder = async () => {
  const configPaths = await workspace.findFiles(
    'config/initializers/copy_tuner.rb'
  );
  if (configPaths.length === 0) {
    return null;
  }
  return workspace.getWorkspaceFolder(configPaths[0]) || null;
};

export const getApiKey = async () => {
  const workspaceFolder = await getWorkspaceFolder();
  if (!workspaceFolder) {
    return null;
  }
  const { stdout } = await exec(
    "bundle exec rails runner 'puts CopyTunerClient.configuration.api_key'",
    {
      cwd: workspaceFolder.uri.path,
    }
  );
  return stdout.trim().match(/^[a-f0-9]{48}$/) ? stdout : null;
};

export const download = async (silent = false) => {
  const workspaceFolder = await getWorkspaceFolder();
  if (!workspaceFolder) {
    return;
  }

  try {
    await exec(
      'bundle exec rake copy_tuner:export[tmp/copy_tuner.yml]',
      {
        cwd: workspaceFolder.uri.path,
      }
    );
  } catch (error) {
    if (error instanceof Error) {
      window.showErrorMessage(error.message);
    }
    return;
  }

  const files = await workspace.findFiles('tmp/copy_tuner.yml');
  if (files.length === 0) {
    return;
  }
  const workspaceEdit = new WorkspaceEdit();
  const oldPath = files[0].path;
  const newPath = oldPath.replace(
    'tmp/copy_tuner.yml',
    'tmp/locales/copy_tuner.yml'
  );
  workspaceEdit.renameFile(Uri.file(oldPath), Uri.file(newPath), {
    overwrite: true,
  });
  await workspace.applyEdit(workspaceEdit);
  if (!silent) {
    window.showInformationMessage('Download of copy_tuner.yml is complete.');
  }
};

const getTranslations = (): Map<string, Translation> => {
  return (
    extensions.getExtension('aki77.rails-i18n')?.exports.i18n.entries() ??
    new Map()
  );
};

export const generateCopytunerUrl = (
  apiKey: string,
  path: string = ''
): Uri => {
  return Uri.parse(
    `https://copy-tuner.herokuapp.com/projects/${apiKey}/${path}`
  );
};

type QuickPickItemWithPath = QuickPickItem & { path: string };

export const goto = async (apiKey: string): Promise<void> => {
  const items: Array<QuickPickItemWithPath> = Array.from(getTranslations()).map(
    ([key, translation]) => {
      return {
        label: key,
        detail: translation.value,
        path: `/blurbs/${key}/edit`,
      };
    }
  );
  const defaultItem: QuickPickItemWithPath = {
    label: 'Project page',
    detail: 'Go to project top page',
    picked: true,
    path: '',
  };

  const selectedItem = await window.showQuickPick([defaultItem, ...items], {
    matchOnDetail: true,
  });
  if (!selectedItem) {
    return;
  }

  await commands.executeCommand(
    'vscode.open',
    generateCopytunerUrl(apiKey, selectedItem.path)
  );
};
