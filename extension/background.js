// Sentinel — background service worker
// Aggregates active-tab time per category, flushes to ingest-signal every 5 minutes.

const CATEGORIES = {
  focus: ["github.com", "linear.app", "notion.so", "figma.com", "vscode.dev", "stackoverflow.com", "docs.google.com"],
  comms: ["slack.com", "mail.google.com", "outlook.live.com", "teams.microsoft.com", "discord.com"],
  scatter: ["twitter.com", "x.com", "reddit.com", "youtube.com", "instagram.com", "tiktok.com", "facebook.com", "news.ycombinator.com"],
};

const FLUSH_MIN = 5;
const STORAGE_KEY = "sentinel_buckets";
const CFG_KEY = "sentinel_cfg";

function classify(url) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    for (const [cat, list] of Object.entries(CATEGORIES)) {
      if (list.some((d) => host === d || host.endsWith("." + d))) return cat;
    }
    return "other";
  } catch {
    return "other";
  }
}

async function getBuckets() {
  const r = await chrome.storage.local.get(STORAGE_KEY);
  return r[STORAGE_KEY] || { focus: 0, comms: 0, scatter: 0, other: 0, switches: 0, last: Date.now(), lastCat: null };
}

async function tick(activeUrl) {
  const b = await getBuckets();
  const now = Date.now();
  const dt = Math.min(60_000, now - b.last); // cap to 1 min per tick
  const cat = activeUrl ? classify(activeUrl) : "other";
  b[cat] += dt;
  if (b.lastCat && b.lastCat !== cat) b.switches += 1;
  b.lastCat = cat;
  b.last = now;
  await chrome.storage.local.set({ [STORAGE_KEY]: b });
}

async function flush() {
  const b = await getBuckets();
  const cfg = (await chrome.storage.local.get(CFG_KEY))[CFG_KEY];
  if (!cfg?.endpoint || !cfg?.token) return;

  const total = b.focus + b.comms + b.scatter + b.other;
  if (total < 30_000) return; // less than 30s of activity, skip

  const points = [
    { layer: "device", source: "chrome_ext", signal_type: "focus_ms", value: b.focus, category: "focus" },
    { layer: "device", source: "chrome_ext", signal_type: "comms_ms", value: b.comms, category: "comms" },
    { layer: "device", source: "chrome_ext", signal_type: "scatter_ms", value: b.scatter, category: "scatter" },
    { layer: "device", source: "chrome_ext", signal_type: "context_switches", value: b.switches, category: "restlessness" },
  ];

  try {
    const r = await fetch(cfg.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cfg.token}`,
        apikey: cfg.anon || cfg.token,
      },
      body: JSON.stringify({ points }),
    });
    if (r.ok) {
      await chrome.storage.local.set({
        [STORAGE_KEY]: { focus: 0, comms: 0, scatter: 0, other: 0, switches: 0, last: Date.now(), lastCat: b.lastCat },
      });
    }
  } catch (e) {
    console.warn("[Sentinel] flush failed", e);
  }
}

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  try {
    const tab = await chrome.tabs.get(tabId);
    if (tab?.url) await tick(tab.url);
  } catch {}
});

chrome.tabs.onUpdated.addListener(async (_id, info, tab) => {
  if (info.status === "complete" && tab?.active && tab.url) await tick(tab.url);
});

chrome.alarms.create("sentinel-tick", { periodInMinutes: 1 });
chrome.alarms.create("sentinel-flush", { periodInMinutes: FLUSH_MIN });

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "sentinel-tick") {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    if (tab?.url) await tick(tab.url);
  }
  if (alarm.name === "sentinel-flush") await flush();
});
