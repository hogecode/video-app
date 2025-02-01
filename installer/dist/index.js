"use strict";
//Example: npx ts-node index.ts --dir ./my-repo --videoFolder ./path/to/video
//ToDo: このスクリプトをpkgでバイナリ化
//Example: pkg . --targets node18-win-x64 --output video_app.exe
//Note: GitHubからクローンするので変更したらすぐcommitする必要
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const inquirer_1 = __importDefault(require("inquirer"));
const simple_git_1 = __importDefault(require("simple-git"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// import args from 'args';
const child_process_1 = require("child_process");
const util_1 = require("util");
const ini_1 = __importDefault(require("ini"));
// 定数設定
const REPO_URL = 'https://github.com/shun103100000/video_app.git'; // GitHubのリポジトリURL
const CONFIG_PATH = path_1.default.resolve(__dirname, '..', 'backend', 'config.ini'); // config.iniのパス
// execはコールバックベースなのでpromise化
const execPromise = (0, util_1.promisify)(child_process_1.exec);
/* コマンドライン引数の設定
args
  .option('dir', 'クローン先の空のディレクトリの絶対パス') // デフォルト値を設定しない
  .option('videoFolder', '配信する動画フォルダの絶対パス'); // デフォルト値を設定しない

const flags = args.parse(process.argv);
*/
// コマンドライン引数の設定
const args = require('minimist')(process.argv.slice(2));
// Git操作を行うsimple-gitのインスタンス
const git = (0, simple_git_1.default)();
/**
 * 複数の文字列配列を引数に取り、それらの文字列をconfig.iniの[folders]セクションのpathsに書き込む非同期関数
 * アプリ初期化時にexeから使う用途
 * Memo: 多分移動したほうがいい
 * @param folderPaths 複数の文字列配列（各配列にはフォルダパスが含まれる）
 * @returns {Promise<void>} 書き込みが完了するまでの非同期処理
 */
function writeFolderPathsToConfig(...folderPaths) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // 現在のconfig.iniファイルを非同期で読み込む
            const configFileContent = yield fs_1.default.promises.readFile(CONFIG_PATH, 'utf-8');
            // 既存の設定をパース
            const config = ini_1.default.parse(configFileContent);
            // pathsに新しいフォルダパスを追加
            config.folders = config.folders || {}; // foldersセクションがない場合は作成
            config.folders.paths = folderPaths.join(','); // 複数のフォルダパスをカンマ区切りの文字列として格納
            // 新しい内容をconfig.iniファイルに書き込む
            yield fs_1.default.promises.writeFile(CONFIG_PATH, ini_1.default.stringify(config));
            console.log('config.iniが更新されました');
        }
        catch (err) {
            console.error('config.iniの書き込み中にエラーが発生しました:', err);
            throw err; // エラーを再スロー
        }
    });
}
// GitHubリポジトリをクローンする関数
const cloneRepo = (repoUrl, targetDir) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(`リポジトリをクローンしています: ${repoUrl} -> ${targetDir}`);
        yield git.clone(repoUrl, targetDir);
        console.log('リポジトリのクローンが完了しました。');
    }
    catch (error) {
        console.error('リポジトリのクローンに失敗しました:', error);
        throw error;
    }
});
// 動画フォルダ情報をPrismaを使って保存
const saveVideoFolder = (folderName) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Memo: 関数の引数は配列
        writeFolderPathsToConfig(folderName);
        console.log('動画フォルダ情報がconfig.iniに保存されました。');
    }
    catch (error) {
        console.log('nodeがインストールされているか確認してください。');
        console.error('動画フォルダ情報の保存に失敗しました:', error);
        throw error;
    }
});
// npm installを実行する関数
const installDependencies = (dir) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('依存関係をインストールしています...');
        // インストールしたフォルダ/backendにライブラリをインストール
        yield execPromise('npm install', { cwd: path_1.default.join(dir, '..', 'backend') });
        console.log('依存関係のインストールが完了しました。');
    }
    catch (error) {
        console.log('nodeがインストールされているか確認してください。');
        console.error('依存関係のインストールに失敗しました:', error);
        throw error;
    }
});
// Prismaマイグレーションを実行する関数
const runPrismaMigrate = (dir) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Prismaマイグレーションを実行しています...');
        // Prismaのインストールを確認
        yield execPromise('npm install prisma --save-dev', { cwd: path_1.default.join(dir, '..', 'backend') });
        console.log('Prismaのインストールが完了しました。');
        const schemaPath = path_1.default.resolve(dir, '..', 'backend', 'src', 'prisma', 'schema.prisma');
        // Prismaのマイグレーションコマンドを実行
        yield execPromise(`npx prisma migrate dev --schema=${schemaPath}`);
        console.log('Prismaマイグレーションが完了しました。');
    }
    catch (error) {
        console.error('Prismaマイグレーションの実行に失敗しました:', error);
        throw error; // エラーが発生した場合は再度投げる
    }
});
// npm installを実行する関数
const buildBackend = (dir) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('バックエンドをビルドしています...');
        // インストールしたフォルダ/backendにライブラリをインストール
        yield execPromise('npx tsc', { cwd: path_1.default.join(dir, '..', 'backend') });
        console.log('ビルドに成功しました。');
    }
    catch (error) {
        console.log('nodeがインストールされているか確認してください。');
        console.error('ビルドに失敗しました:', error);
        throw error;
    }
});
// Expressサーバーを起動する関数
const startServer = (dir) => __awaiter(void 0, void 0, void 0, function* () {
    // ビルド済みの app.js を node で実行
    try {
        // Memo: このパスは本番環境では変える
        const buildPath = path_1.default.join(dir, '..', 'backend', 'dist', 'app.js'); // dist/app.js のパスを指定
        console.log('アプリケーションを起動しています・・・');
        // Note: 実行中はプロミスは返されない
        // Note: 本当はバックグラウンドで実行してプロミスを返したいが、spawnに変えるのは面倒
        // Note: 本番環境ではPM2やforeverを使うのも考える
        console.log('アプリケーションの起動が完了しました。\n' +
            'http://localhost:3002 でアプリケーションにアクセスできます。\n' +
            'ホスト名は適宜127.0.0.1やTailscaleのVPNIPアドレスに変更してください。');
        yield execPromise(`node ${buildPath}`); // nodeコマンドでビルド後のファイルを実行
    }
    catch (error) {
        console.log('nodeがインストールされているか確認してください。');
        console.error('アプリケーションの起動に失敗しました:', error);
        process.exit(1); // エラーが発生した場合、プロセスを終了
    }
});
// 引数を対話型で取得する関数
const getDir = () => __awaiter(void 0, void 0, void 0, function* () {
    if (!args.dir) {
        const answers = yield inquirer_1.default.prompt([
            {
                type: 'input',
                name: 'dir',
                message: 'クローン先のディレクトリのパスを入力してください:',
                default: './my-repo', // デフォルト値を設定
            },
        ]);
        return answers.dir;
    }
    return args.dir; // 引数があればそのまま使用
});
const getVideoFolder = () => __awaiter(void 0, void 0, void 0, function* () {
    if (!args.videoFolder) {
        const answers = yield inquirer_1.default.prompt([
            {
                type: 'input',
                name: 'videoFolder',
                message: '動画を保存するフォルダのパスを入力してください:',
                default: './videos', // デフォルト値を設定
            },
        ]);
        return answers.videoFolder;
    }
    return args.videoFolder; // 引数があればそのまま使用
});
// メイン処理
const runApp = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('インストーラの初期化を開始します...');
        // 引数が指定されていない場合、inquirerで取得
        const targetDir = yield getDir();
        const videoFolder = yield getVideoFolder();
        console.log('引数は', { targetDir, videoFolder }, 'です。');
        if (typeof targetDir === 'string' && targetDir.trim() !== '') {
            if (!fs_1.default.existsSync(targetDir)) {
                console.log('ターゲットディレクトリが存在しません。作成します...');
                fs_1.default.mkdirSync(targetDir, { recursive: true });
            }
        }
        else {
            console.error('無効なターゲットディレクトリが指定されています。');
        }
        // リポジトリをクローン
        yield cloneRepo(REPO_URL, targetDir);
        // 動画フォルダ情報を保存
        yield saveVideoFolder(videoFolder);
        // クローン後にnpm installを実行
        yield installDependencies(targetDir);
        yield runPrismaMigrate(targetDir);
        yield buildBackend(targetDir);
        // Expressサーバーを起動
        yield startServer(targetDir);
    }
    catch (error) {
        console.error('エラーが発生しました:', error);
        process.exit(1);
    }
});
// スクリプト実行
runApp();
