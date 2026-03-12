// public/sw-custom.js
// This file is imported into the generated service worker by next-pwa

const OFFLINE_URL    = "/offline";
const CACHE_NAME     = "dropos-v1";
const PUSH_TAG       = "dropos-push";

// ── Install: pre-cache offline page ─────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(["/offline", "/manifest.json", "/icons/icon-192.png"])
    )
  );
  self.skipWaiting();
});

// ── Activate: clean old caches ───────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME && !k.startsWith("workbox-"))
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch: offline fallback ───────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(OFFLINE_URL))
    );
  }
});

// ── Push: receive and show notification ─────────────────────────────────────
self.addEventListener("push", (event) => {
  if (!event.data) return;

  let data;
  try { data = event.data.json(); }
  catch { data = { title: "DropOS", body: event.data.text() }; }

  const { title, body, icon, badge, url, tag, actions, image } = data;

  const opts = {
    body:    body || "You have a new notification",
    icon:    icon  || "/icons/icon-192.png",
    badge:   badge || "/icons/icon-72.png",
    tag:     tag   || PUSH_TAG,
    image:   image,
    vibrate: [100, 50, 100],
    data:    { url: url || "/dashboard/notifications", dateOfArrival: Date.now() },
    actions: actions || [
      { action: "view",    title: "View",    icon: "/icons/icon-72.png" },
      { action: "dismiss", title: "Dismiss"                             },
    ],
    requireInteraction: tag === "new-order",
  };

  event.waitUntil(
    self.registration.showNotification(title || "DropOS", opts)
  );
});

// ── Notification click ────────────────────────────────────────────────────────
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") return;

  const url = event.notification.data?.url || "/dashboard";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      // Focus existing window if open
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      // Open new window
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});

// ── Background sync (retry failed API calls) ────────────────────────────────
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-actions") {
    event.waitUntil(replayFailedActions());
  }
});

async function replayFailedActions() {
  // Open IndexedDB and replay any queued mutations
  try {
    const db = await openDB("dropos-offline", 1);
    const tx = db.transaction("actions", "readwrite");
    const store = tx.objectStore("actions");
    const items = await store.getAll();

    for (const item of items) {
      try {
        await fetch(item.url, {
          method:  item.method,
          headers: { "Content-Type": "application/json", "Authorization": item.token },
          body:    JSON.stringify(item.body),
        });
        await store.delete(item.id);
      } catch {
        // Still offline — leave in queue
      }
    }
  } catch {
    // IDB not available
  }
}

// Simple IDB helper (no import needed in SW context)
function openDB(name, version) {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(name, version);
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains("actions")) {
        db.createObjectStore("actions", { keyPath: "id", autoIncrement: true });
      }
    };
  });
}
