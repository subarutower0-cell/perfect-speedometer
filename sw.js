/* ドップラー速度計の通知係(サービスワーカー)
   index.html と同じ場所に置く。アプリを閉じていても、サーバーから届いた
   通知をここで受け取って画面に出す。
   ※ ページの保存(オフライン化)はしない。古い index.html が残り続ける
     トラブルを避けるため。                                          */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; }
  catch (_) { d = { title: "速度計", body: e.data ? e.data.text() : "" }; }
  e.waitUntil(self.registration.showNotification(d.title || "速度計", {
    body: d.body || "",
    tag: d.tag || "vd-train",
    renotify: true,
    data: { url: self.registration.scope },
  }));
});

/* 通知を押したら、開いている画面に切り替える(無ければ開く) */
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil((async () => {
    const list = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const c of list) { if ("focus" in c) return c.focus(); }
    return self.clients.openWindow((e.notification.data && e.notification.data.url) || "./");
  })());
});
