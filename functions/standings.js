// טבלת הליגה מאתר איגוד הכדורסל – נקראת דרך Cloudflare (האתר חוסם את השרתים של גוגל)
export async function onRequest(context) {
  const league = new URL(context.request.url).searchParams.get("league") || "";
  if (!/^[0-9]{4}-[0-9]{1,6}$/.test(league)) return json({ error: "bad league" }, 400);

  const cache = caches.default;
  const key = new Request("https://imunim-cache/standings-v2/" + league);
  const hit = await cache.match(key);
  if (hit) return hit;

  let res;
  try {
    res = await fetch("https://ibasketball.co.il/league/" + league + "/", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "he-IL,he;q=0.9,en;q=0.8"
      }
    });
  } catch (e) {
    return json({ error: String(e) }, 502);
  }
  if (!res.ok) return json({ error: "status " + res.status }, 502);
  const html = await res.text();

  let best = null, bestRows = [];
  for (const t of html.match(/<table[\s\S]*?<\/table>/g) || []) {
    if (t.indexOf("sp-league-table") < 0 && t.indexOf("נק") < 0) continue;
    const rows = (t.match(/<tr[\s\S]*?<\/tr>/g) || [])
      .map(tr => (tr.match(/<td[\s\S]*?<\/td>/g) || []).map(cellText))
      .filter(r => r.length > 3);
    if (rows.length > bestRows.length) { best = t; bestRows = rows; }
  }
  if (!best) return json({ error: "no table" }, 404);

  const headers = (best.match(/<th[\s\S]*?<\/th>/g) || []).map(cellText);
  const updated = new Date().toLocaleString("he-IL", {
    timeZone: "Asia/Jerusalem", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit"
  }).replace(/\//g, ".").replace(",", "");
  const out = json({ headers, rows: bestRows, updated }, 200, 3 * 3600);
  context.waitUntil(cache.put(key, out.clone()));
  return out;
}

function cellText(h) {
  return h.replace(/<[^>]+>/g, " ")
    .replace(/&quot;/g, '"').replace(/&#0?39;|&#8217;|&#x27;/g, "'").replace(/&#8211;|&#8212;/g, "–")
    .replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/&#[0-9]+;/g, "")
    .replace(/\s+/g, " ").trim();
}

function json(o, status, maxAge) {
  return new Response(JSON.stringify(o), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": maxAge ? "public, max-age=" + maxAge : "no-store"
    }
  });
}
