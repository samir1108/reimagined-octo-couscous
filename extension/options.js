const KEY = "sentinel_cfg";

chrome.storage.local.get(KEY, (r) => {
  const c = r[KEY] || {};
  endpoint.value = c.endpoint || "";
  token.value = c.token || "";
  anon.value = c.anon || "";
});

save.onclick = () => {
  chrome.storage.local.set(
    { [KEY]: { endpoint: endpoint.value.trim(), token: token.value.trim(), anon: anon.value.trim() } },
    () => { msg.textContent = "Saved ✓"; msg.className = "ok"; },
  );
};

importClip.onclick = async () => {
  try {
    const txt = await navigator.clipboard.readText();
    const cfg = JSON.parse(txt);
    if (!cfg.endpoint || !cfg.token) throw new Error("Missing endpoint/token");
    if (cfg.kind && cfg.kind !== "consciousos-sentinel-config") throw new Error("Wrong payload");
    endpoint.value = cfg.endpoint;
    token.value = cfg.token;
    anon.value = cfg.anon || "";
    chrome.storage.local.set({ [KEY]: { endpoint: cfg.endpoint, token: cfg.token, anon: cfg.anon || "" } });
    importMsg.textContent = "Imported & saved ✓ — you can close this tab.";
    importMsg.className = "ok";
  } catch (e) {
    importMsg.textContent = "Couldn't read clipboard: " + e.message;
    importMsg.className = "err";
  }
};

test.onclick = async () => {
  try {
    const r = await fetch(endpoint.value.trim(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.value.trim()}`,
        apikey: (anon.value || token.value).trim(),
      },
      body: JSON.stringify({
        points: [{ layer: "device", source: "chrome_ext", signal_type: "ping", value: 1, category: "focus" }],
      }),
    });
    const j = await r.json().catch(() => ({}));
    msg.textContent = r.ok ? "Test ping sent ✓ " + JSON.stringify(j) : "Failed: " + r.status + " " + JSON.stringify(j);
    msg.className = r.ok ? "ok" : "err";
  } catch (e) {
    msg.textContent = "Network error: " + e.message;
    msg.className = "err";
  }
};
