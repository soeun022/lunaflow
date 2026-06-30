export function register() {
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register(`${import.meta.env.BASE_URL}sw.js`)
        .then((registration) => {
          console.log('LunaFlow ServiceWorker registered successfully: ', registration.scope);
        })
        .catch((error) => {
          console.error('LunaFlow ServiceWorker registration failed: ', error);
        });
    });
  }
}
