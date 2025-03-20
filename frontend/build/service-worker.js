//ToDo: PWA対応するためにserviceWorkerを登録
//Memo: ただし、HTTPS化しないと使えないブラウザAPIが多い

const CACHE_NAME = 'my-site-cache-v1';

// キャッシュしたい静的ファイルのリスト
const urlsToCache = [
  '/',
  '/index.html', // 例えば、インデックスページなどもキャッシュ
];

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg'];

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

// フェッチイベントをリッスンし、画像リクエストがあればキャッシュを返す
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // 画像の拡張子がPNGまたはJPGかどうかをチェック
  if (IMAGE_EXTENSIONS.some(ext => url.pathname.endsWith(ext))) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        // キャッシュがあればそれを返し、無ければネットワークから取得
        return cachedResponse || fetch(event.request).then((response) => {
          // 新しく取得したレスポンスをキャッシュに保存
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, response.clone());
            return response;
          });
        });
      })
    );
  }
});

// フェッチイベントでリソースをキャッシュから返す
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // キャッシュがあればそれを返す
      if (cachedResponse) {
        return cachedResponse;
      }

      // キャッシュがなければ、ネットワークから取得してキャッシュする
      return fetch(event.request).then((response) => {
        // レスポンスが有効な場合、キャッシュに保存
        if (response && response.status === 200 && response.type === 'basic') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      });
    })
  );
});