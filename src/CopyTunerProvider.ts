import {
  CodeActionProvider,
  TextDocument,
  Range,
  CodeAction,
  CodeActionKind,
  Uri,
  workspace
} from "vscode";

export class CopyTunerProvider implements CodeActionProvider {
  constructor(private token: string) {}

  public provideCodeActions(document: TextDocument, range: Range) {
    const i18nKey = this.getI18nKey(document, range);
    if (!i18nKey) {
      return null;
    }
    const action = new CodeAction("Open copytuner...", CodeActionKind.Empty);
    action.command = {
      command: "vscode.open",
      title: "Open copytuner",
      arguments: [
        Uri.parse(
          `https://copy-tuner.herokuapp.com/projects/${
            this.token
          }/blurbs/${i18nKey}/edit/`
        )
      ]
    };
    return [action];
  }

  private getI18nKey(document: TextDocument, range: Range) {
    const methods = workspace.getConfiguration("railsI18n").translateMethods;
    const i18nRegexp = new RegExp(
      `[^a-z.](?:${methods.join("|")})['"\\s(]+([a-zA-Z0-9_.]*)`
    );
    const wordRange = document.getWordRangeAtPosition(range.start, i18nRegexp);
    if (!wordRange) {
      return null;
    }
    const matched = document.getText(wordRange).match(i18nRegexp);
    if (!matched) {
      return null;
    }
    return matched[1];
  }
}
