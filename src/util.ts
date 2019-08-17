import { workspace, window, WorkspaceEdit, Uri } from "vscode";
import execa = require("execa");

const getWorkspaceFolder = async () => {
  const configPaths = await workspace.findFiles(
    "config/initializers/copy_tuner.rb"
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
  const { stdout } = await execa(
    "bundle",
    ["exec", "rails", "runner", "puts CopyTunerClient.configuration.api_key"],
    {
      cwd: workspaceFolder.uri.path
    }
  );
  return stdout.match(/^[a-f0-9]{48}$/) ? stdout : null;
};

export const download = async (silent = false) => {
  const workspaceFolder = await getWorkspaceFolder();
  if (!workspaceFolder) {
    return;
  }
  const { exitCode, stderr } = await execa(
    "bundle",
    ["exec", "rake", "copy_tuner:export"],
    {
      cwd: workspaceFolder.uri.path
    }
  );
  if (exitCode > 0) {
    window.showErrorMessage(stderr);
    return;
  }
  const files = await workspace.findFiles("config/locales/copy_tuner.yml");
  if (files.length === 0) {
    return;
  }
  const workspaceEdit = new WorkspaceEdit();
  const oldPath = files[0].path;
  const newPath = oldPath.replace(
    "config/locales/copy_tuner.yml",
    "tmp/locales/copy_tuner.yml"
  );
  workspaceEdit.renameFile(Uri.file(oldPath), Uri.file(newPath), {
    overwrite: true
  });
  await workspace.applyEdit(workspaceEdit);
  if (!silent) {
    window.showInformationMessage("Download of copy_tuner.yml is complete.");
  }
};
