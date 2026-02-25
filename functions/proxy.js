// Cloudflare Pages Function — proxies requests to Shopify stores
// This runs on Cloudflare’s edge, so no CORS issues.

const ALLOWED_HOSTS = [
“alchemist.global”,
“themaillardproject.com.au”,
“www.proudmarycoffee.com.au”,
“margaretriverroasting.com.au”,
];

export async function onRequest(context) {
const reqUrl = new URL(context.request.url);
const target = reqUrl.searchParams.get(“url”);

if (!target) {
return new Response(JSON.stringify({ error: “Missing url parameter” }), {
status: 400,
headers: { “Content-Type”: “application/json” },
});
}

// Validate target is an allowed Shopify store
let targetUrl;
try {
targetUrl = new URL(target);
} catch {
return new Response(JSON.stringify({ error: “Invalid URL” }), {
status: 400,
headers: { “Content-Type”: “application/json” },
});
}

if (!ALLOWED_HOSTS.includes(targetUrl.hostname)) {
return new Response(JSON.stringify({ error: “Domain not allowed” }), {
status: 403,
headers: { “Content-Type”: “application/json” },
});
}

try {
const response = await fetch(target, {
headers: { “User-Agent”: “MyCoffeeRabbitHole/1.0” },
});
const data = await response.text();

```
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
return new Response(JSON.stringify({ error: err.message }), {
status: 502,
headers: { “Content-Type”: “application/json” },
});
}
}