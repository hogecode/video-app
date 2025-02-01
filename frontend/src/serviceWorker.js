//ToDo: PWA対応するためにserviceWorkerを登録
//Memo: ただし、HTTPS化しないと使えないブラウザAPIが多い

const CACHE_NAME = 'my-site-cache-v1';

// キャッシュしたい静的ファイルのリスト
const urlsToCache = [
  '/manifest.json',
  '/logo192.png',
  '/logo512.png',
  // 他にキャッシュしたい静的ファイルを追加
  '/',
  '/index.html', // 例えば、インデックスページなどもキャッシュ
];

// インストール時の処理
this.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Caching all files');
      return cache.addAll(urlsToCache);
    })
  );
});

// アクティベート時の処理
this.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  // 不要なキャッシュを削除
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName); // 使われていないキャッシュを削除
          }
        })
      );
    })
  );
});

// リクエスト時の処理
this.addEventListener('fetch', (event) => {
  console.log('Service Worker: Fetching...', event.request.url);
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // キャッシュにある場合はキャッシュから返し、無ければネットワークから取得
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request);
    })
  );
});