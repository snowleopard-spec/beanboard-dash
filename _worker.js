// _worker.js — Cloudflare Pages Advanced Mode
// Handles /proxy requests to bypass CORS, passes everything else to static assets.

const ALLOWED_HOSTS = [
“alchemist.global”,
“themaillardproject.com.au”,
“www.proudmarycoffee.com.au”,
“margaretriverroasting.com.au”,
];

export default {
async fetch(request, env) {
const url = new URL(request.url);

```
// Only intercept /proxy requests
if (url.pathname === "/proxy") {
  return handleProxy(url);
}

// Everything else: serve static assets from Pages
return env.ASSETS.fetch(request);
```

},
};

async function handleProxy(url) {
const target = url.searchParams.get(“url”);

if (!target) {
return jsonResponse({ error: “Missing url parameter” }, 400);
}

let targetUrl;
try {
targetUrl = new URL(target);
} catch {
return jsonResponse({ error: “Invalid URL” }, 400);
}

if (!ALLOWED_HOSTS.includes(targetUrl.hostname)) {
return jsonResponse({ error: “Domain not allowed: “ + targetUrl.hostname }, 403);
}

try {
const response = await fetch(target, {
headers: {
“User-Agent”: “MyCoffeeRabbitHole/1.0”,
“Accept”: “application/json”,
},
});

```
const data = await response.text();

return new Response(data, {
  status: response.status,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "public, max-age=300",
  },
});
```

} catch (err) {
return jsonResponse({ error: err.message }, 502);
}
}

function jsonResponse(obj, status = 200) {
return new Response(JSON.stringify(obj), {
status,
headers: { “Content-Type”: “application/json”, “Access-Control-Allow-Origin”: “*” },
});
}