# CopyTuner

CopyTuner code action provider.

## Features

![demo](https://i.gyazo.com/e9deee3a26dd8b1a80a8b61901468140.gif)

## Installation

1. [releases](https://github.com/SonicGarden/vscode-copy-tuner/releases)から`.vsix`ファイルをダウンロード
2. `code --install-extension copy-tuner-x.x.x.vsix`

## Commands

- `copyTuner.download`: 最新の翻訳データをtmpディレクトリにダウンロードします。
- `copyTuner.goto`: 一覧から選択した翻訳のCopyTuner編集画面を開きます。

## Requirements

- `copy_tuner_client` gem
  - `0.6.2`以上が必要です
- [Rails I18n \- Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=aki77.rails-i18n)
  - 自動的にインストールされます

## Rails I18n Extension Settings

- `railsI18n.translateMethods`: `["I18n.translate", "I18n.t", "t", "tt"]`と設定してください。
- `railsI18n.localeFilePattern`: `{config,tmp}/locales/*.yml`と設定してください。
