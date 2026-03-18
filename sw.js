// Imports
importScripts('js/sw-utils.js');

// Caches
const CACHE_STATIC = 'static-v1';
const CACHE_INMUTABLE = 'inmutable-v1';

const CACHE_DYNAMIC = 'dynamic-v1';
const CACHE_DYNAMIC_LIMIT = 50;

const APP_SHELL_STATIC = [
  '/',
  'index.html',
  'manifest.json',
  'css/style.css',
  'img/favicon.ico',
  'img/avatars/hulk.jpg',
  'img/avatars/ironman.jpg',
  'img/avatars/spiderman.jpg',
  'img/avatars/thor.jpg',
  'img/avatars/wolverine.jpg',
  'js/app.js',
  'js/sw-utils.js'
];

const APP_SHELL_INMUTABLE = [
  'https://fonts.googleapis.com/css?family=Quicksand:300,400',
  'https://fonts.googleapis.com/css?family=Lato:400,300',
  'https://use.fontawesome.com/releases/v5.3.1/css/all.css',
  'css/animate.css',
  'js/libs/jquery.js'
];

// Install
self.addEventListener('install', e => {

  const cacheStatic = caches.open(CACHE_STATIC)
    .then(cache => cache.addAll(APP_SHELL_STATIC));

  const cacheInmutable = caches.open(CACHE_INMUTABLE)
    .then(cache => cache.addAll(APP_SHELL_INMUTABLE));

  e.waitUntil( Promise.all([cacheStatic, cacheInmutable]) );

});

// Activate
self.addEventListener('activate', e => {

  const response = caches.keys()
    .then(keys => {
      keys.forEach(key => {
        if (key !== CACHE_STATIC && key.includes('static')) {
          return caches.delete(key);
        }
      });
    });

  e.waitUntil(response);

});

// Cache management
self.addEventListener('fetch', e => {

  const response = caches.match(e.request)
    .then(matchResponse => {
      if (matchResponse) {
        return matchResponse;
      } else {
        return fetch(e.request.url)
          .then(fetchResponse => {
            return updateDynamicCache(CACHE_DYNAMIC, e.request, fetchResponse);
          });
      }
    });

  e.respondWith(response);

});