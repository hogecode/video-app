//Example: npx ts-node index.ts --dir ./my-repo --videoFolder ./path/to/video
//ToDo: このスクリプトをpkgでバイナリ化
//Example: pkg . --targets node18-win-x64 --output video_app.exe
//Note: GitHubからクローンするので変更したらすぐcommitする必要

// import args from 'args';
import { exec } from 'child_process';
import fs from 'fs';
import ini from 'ini';
import inquirer from 'inquirer';
import path from 'path';
import simpleGit, { SimpleGit } from 'simple-git';
import { promisify } from 'util';

// 定数設定
const REPO_URL = 'https://github.com/shun103100000/video_app.git'; // GitHubのリポジトリURL
const CONFIG_PATH = path.resolve(__dirname, '..','backend', 'config.ini'); // config.iniのパス

// execはコールバックベースなのでpromise化
const execPromise = promisify(exec);

/* コマンドライン引数の設定
args
  .option('dir', 'クローン先の空のディレクトリの絶対パス') // デフォルト値を設定しない
  .option('videoFolder', '配信する動画フォルダの絶対パス'); // デフォルト値を設定しない

const flags = args.parse(process.argv);
*/

// コマンドライン引数の設定
const args = require('minimist')(process.argv.slice(2));

// Git操作を行うsimple-gitのインスタンス
const git: SimpleGit = simpleGit();

/**
 * 複数の文字列配列を引数に取り、それらの文字列をconfig.iniの[folders]セクションのpathsに書き込む非同期関数
 * アプリ初期化時にexeから使う用途
 * Memo: 多分移動したほうがいい
 * @param folderPaths 複数の文字列配列（各配列にはフォルダパスが含まれる）
 * @returns {Promise<void>} 書き込みが完了するまでの非同期処理
 */
async function writeFolderPathsToConfig(...folderPaths: string[]): Promise<void> {
  try {
    // 現在のconfig.iniファイルを非同期で読み込む
    const configFileContent = await fs.promises.readFile(CONFIG_PATH, 'utf-8');

    // 既存の設定をパース
    const config = ini.parse(configFileContent);

    // pathsに新しいフォルダパスを追加
    config.folders = config.folders || {}; // foldersセクションがない場合は作成
    config.folders.paths = folderPaths.join(','); // 複数のフォルダパスをカンマ区切りの文字列として格納

    // 新しい内容をconfig.iniファイルに書き込む
    await fs.promises.writeFile(CONFIG_PATH, ini.stringify(config));

    console.log('config.iniが更新されました');
  } catch (err) {
    console.error('config.iniの書き込み中にエラーが発生しました:', err);
    throw err;  // エラーを再スロー
  }
}

// GitHubリポジトリをクローンする関数
const cloneRepo = async (repoUrl: string, targetDir: string): Promise<void> => {
  try {
    console.log(`リポジトリをクローンしています: ${repoUrl} -> ${targetDir}`);
    await git.clone(repoUrl, targetDir);
    console.log('リポジトリのクローンが完了しました。');
  } catch (error) {
    console.error('リポジトリのクローンに失敗しました:', error);
    throw error;
  }
};

// 動画フォルダ情報をPrismaを使って保存
const saveVideoFolder = async (folderName: string) => {
  try {
    // Memo: 関数の引数は配列
    writeFolderPathsToConfig(folderName);
    console.log('動画フォルダ情報がconfig.iniに保存されました。');
  } catch (error) {
    console.log('nodeがインストールされているか確認してください。');
    console.error('動画フォルダ情報の保存に失敗しました:', error);
    throw error;
  }
};

// npm installを実行する関数
const installDependencies = async (dir: string) => {
  try {
    console.log('依存関係をインストールしています...');
    // インストールしたフォルダ/backendにライブラリをインストール
    await execPromise('npm install', { cwd: path.join(dir,'..', 'backend') });
    console.log('依存関係のインストールが完了しました。');
  } catch (error) {
    console.log('nodeがインストールされているか確認してください。');
    console.error('依存関係のインストールに失敗しました:', error);
    throw error;
  }
};

// Prismaマイグレーションを実行する関数
const runPrismaMigrate = async (dir: string) => {
  try {
    console.log('Prismaマイグレーションを実行しています...');

    // Prismaのインストールを確認
    await execPromise('npm install prisma --save-dev', { cwd: path.join(dir,'..', 'backend') });
    console.log('Prismaのインストールが完了しました。');

    const schemaPath = path.resolve(
      dir,
      '..',
      'backend',
      'src',
      'prisma',
      'schema.prisma'
    );

    // Prismaのマイグレーションコマンドを実行
    await execPromise(`npx prisma migrate dev --schema=${schemaPath}`);
    console.log('Prismaマイグレーションが完了しました。');
  } catch (error) {
    console.error('Prismaマイグレーションの実行に失敗しました:', error);
    throw error; // エラーが発生した場合は再度投げる
  }
};

// npm installを実行する関数
const buildBackend = async (dir: string) => {
  try {
    console.log('バックエンドをビルドしています...');
    // インストールしたフォルダ/backendにライブラリをインストール
    await execPromise('npx tsc', { cwd: path.join(dir,'..', 'backend') });
    console.log('ビルドに成功しました。');
  } catch (error) {
    console.log('nodeがインストールされているか確認してください。');
    console.error('ビルドに失敗しました:', error);
    throw error;
  }
};

// Expressサーバーを起動する関数
const startServer = async (dir: string) => {
  // ビルド済みの app.js を node で実行
  try {
    // Memo: このパスは本番環境では変える
    const buildPath = path.join(dir,'..', 'backend', 'dist', 'app.js'); // dist/app.js のパスを指定
    console.log('アプリケーションを起動しています・・・');
    
    // Note: 実行中はプロミスは返されない
    // Note: 本当はバックグラウンドで実行してプロミスを返したいが、spawnに変えるのは面倒
    // Note: 本番環境ではPM2やforeverを使うのも考える
    console.log(
      'アプリケーションの起動が完了しました。\n' +
        'http://localhost:3002 でアプリケーションにアクセスできます。\n' +
        'ホスト名は適宜127.0.0.1やTailscaleのVPNIPアドレスに変更してください。'
    );
    await execPromise(`node ${buildPath}`); // nodeコマンドでビルド後のファイルを実行
  } catch (error) {
    console.log('nodeがインストールされているか確認してください。');
    console.error('アプリケーションの起動に失敗しました:', error);
    process.exit(1); // エラーが発生した場合、プロセスを終了
  }
};

// 引数を対話型で取得する関数
const getDir = async () => {
  if (!args.dir) {
    const answers = await inquirer.prompt([
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
};

const getVideoFolder = async () => {
  if (!args.videoFolder) {
    const answers = await inquirer.prompt([
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
};

// メイン処理
const runApp = async () => {
  try {
    console.log('インストーラの初期化を開始します...');

    // 引数が指定されていない場合、inquirerで取得
    const targetDir = await getDir();
    const videoFolder = await getVideoFolder();

    console.log('引数は', { targetDir, videoFolder }, 'です。');

    
    if (typeof targetDir === 'string' && targetDir.trim() !== '') {
      if (!fs.existsSync(targetDir)) {
        console.log('ターゲットディレクトリが存在しません。作成します...');
        fs.mkdirSync(targetDir, { recursive: true });
      }
    } else {
      console.error('無効なターゲットディレクトリが指定されています。');
    }

    // リポジトリをクローン
    await cloneRepo(REPO_URL, targetDir);

    // 動画フォルダ情報を保存
    await saveVideoFolder(videoFolder);

    // クローン後にnpm installを実行
    await installDependencies(targetDir);

    await runPrismaMigrate(targetDir);

    await buildBackend(targetDir);

    // Expressサーバーを起動
    await startServer(targetDir);
  } catch (error) {
    console.error('エラーが発生しました:', error);
    process.exit(1);
  }
};

// スクリプト実行
runApp();
