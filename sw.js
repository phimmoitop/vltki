const CACHE_NAME = 'VLTKii';
const ASSETS = [
    '/vltkii/',
    '/vltkii/index.html',
    '/vltkii/manifest.json'
];

// Cài đặt SW và Cache file
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

// Lấy dữ liệu từ Cache khi offline
self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((response) => {
            return response || fetch(e.request);
        })
    );
});
