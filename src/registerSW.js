export function register() {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('LunaFlow ServiceWorker registered successfully: ', registration.scope);
        })
        .catch((error) => {
          console.error('LunaFlow ServiceWorker registration failed: ', error);
        });
    });
  }
}
