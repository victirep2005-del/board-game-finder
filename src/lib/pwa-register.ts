export function registerPWA() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return;
  }

  const url = new URL(window.location.href);
  const hostname = url.hostname;

  // Never register in Lovable preview, editor, iframe, or dev.
  if (!import.meta.env.PROD) {
    unregisterSW();
    return;
  }
  if (window.self !== window.top) {
    unregisterSW();
    return;
  }
  if (
    hostname.startsWith("id-preview--") ||
    hostname.startsWith("preview--") ||
    hostname === "lovableproject.com" ||
    hostname.endsWith(".lovableproject.com") ||
    hostname === "lovableproject-dev.com" ||
    hostname.endsWith(".lovableproject-dev.com") ||
    hostname === "beta.lovable.dev" ||
    hostname.endsWith(".beta.lovable.dev")
  ) {
    unregisterSW();
    return;
  }
  if (url.searchParams.get("sw") === "off") {
    unregisterSW();
    return;
  }

  // Register the generated service worker.
  navigator.serviceWorker
    .register("/sw.js", { scope: "/" })
    .then((registration) => {
      console.log("SW registered:", registration.scope);
    })
    .catch((error) => {
      console.error("SW registration failed:", error);
    });
}

function unregisterSW() {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    return;
  }
  navigator.serviceWorker.getRegistration("/sw.js").then((registration) => {
    if (registration) {
      registration.unregister();
      console.log("SW unregistered for preview/dev context");
    }
  });
}
