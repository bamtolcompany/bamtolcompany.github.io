const CACHE_NAME = 'allinone-search-cache-v1';
const faviconUrl = '/favicon.ico';

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.add(faviconUrl))
  );
});

self.addEventListener('fetch', event => {
  if (event.request.url.endsWith(faviconUrl)) {
    // 파비콘 요청일 때만 캐시 확인
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request);
      })
    );
  } else {
    // 나머지 요청은 무조건 네트워크에서 받아오기
    event.respondWith(fetch(event.request));
  }
});
