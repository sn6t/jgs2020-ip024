# JGS 2020 IP-024 Meeting Police

- このコードは[日本 GUIDE/SHARE 委員会](http://www.uken.or.jp/jgs/news/index.html)の 2020 年タスク活動での検証目的での使用を想定して作成しています
- 音声認識（Speech Recognition）機能は[Web Speech API](https://developer.mozilla.org/ja/docs/Web/API/Web_Speech_API)を使用しており、デスクトップ版 Chrome での動作を前提としています（デスクトップ版 Chrome v79 で動作確認済み）。音声認識以外の機能は、デスクトップ版 Firefox、iOS 版 Safari、Android 版 Chrome で動作確認をしています
- 音声認識対象とする音声には業務上の秘密などを含めないことをお勧めします
- アプリ稼働前に.env.sampleは.envにリネームしてください。manifest.yml.sampleはCloud Foundryデプロイ用のサンプルですので、Cloud Foundryにデプロイしない場合は削除いただいて問題ありません
