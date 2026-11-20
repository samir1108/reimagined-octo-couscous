chrome.storage.local.get("sentinel_buckets", (r) => {
  const b = r.sentinel_buckets || { focus: 0, comms: 0, scatter: 0, other: 0, switches: 0 };
  const fmt = (ms) => `${Math.round(ms / 60000)}m`;
  document.getElementById("stats").innerHTML = `
    <div class="row"><span>Focus</span><b>${fmt(b.focus)}</b></div>
    <div class="row"><span>Comms</span><b>${fmt(b.comms)}</b></div>
    <div class="row"><span>Scatter</span><b>${fmt(b.scatter)}</b></div>
    <div class="row"><span>Switches</span><b>${b.switches}</b></div>
  `;
});
