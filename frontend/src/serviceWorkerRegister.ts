
// serviceWorkerの登録処理
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swUrl = `/static/service-worker.js'`; // service worker ファイルのパスを指定
    navigator.serviceWorker
      .register(swUrl)
      .then((registration) => {
        console.log('Service Worker: Registered', registration);
      })
      .catch((error) => {
        console.log('Service Worker: Registration failed', error);
      });
  });
}

// ここでモジュールとして認識させるために、空のexport文を追加
export {};