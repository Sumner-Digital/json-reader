# Structured Data Checker MVP

Minimal **Next.js 15 (App Router, TypeScript, Edge Runtime)** project that exposes an API endpoint to scan a given URL for `application/ld+json` blocks.  
Designed for quick local hacking **with pnpm** and painless deployment to **Vercel Edge Functions**.

---

## ✨ Features
* **Edge-optimised API** – `GET /api/scan?url=…`  
  Fetches the target page, parses the HTML with **cheerio**, returns a report:
  ```jsonc
  {
    "url": "https://example.com",
    "found": 2,
    "json": ["{...}", "{...}"]
  }
  ```
* **CORS enabled** so the endpoint can be called from anywhere (e.g. a Divi “Code” module).
* Extremely small client UI at [`src/app/page.tsx`](src/app/page.tsx:1) – paste a URL, get prettified JSON.
* [`docs/divi-snippet.html`](docs/divi-snippet.html:1) – self-contained snippet to embed in any site / Divi block.
* Batteries-included `next.config.mjs`, `tsconfig.json`, `vercel.json`.

---

## 🛠 Local Development

```bash
# 1. Install dependencies (requires pnpm)
pnpm install

# 2. Run dev server
pnpm dev   # ⇒ http://localhost:3000
```

The form on the home page calls the local `/api/scan` route.  
Open DevTools → Network to see the Edge Function streaming.

---

## 🚀 Deploying to Vercel

1. Push this repo to GitHub (or GitLab/Bitbucket).
2. Click **“Import Project”** in the Vercel dashboard.  
   Vercel auto-detects Next.js 15 and Edge runtime.
3. Done – first deploy should be live in <60 s.

`vercel.json` forces the “edge” preset for all routes; tweak if you add server/full-runtime pages later.

---

## 🔍 API Reference

`GET /api/scan?url={encoded_target_url}`  

Query Param | Required | Description
----------- | -------- | -----------
`url`       | ✔︎ yes   | Absolute URL to fetch

### Responses

Status | JSON structure
------ | --------------
`200`  | `{ url, found, json: [] }`
`400`  | `{ error: "Missing \"url\" query parameter" }`
`502`  | `{ error: "Failed to fetch: 404" }`
`500`  | `{ error: "…message…" }`

---

## 🧰 Ops & FAQ

| Topic | Solution |
| ----- | -------- |
| **CORS** | Wildcard `Access-Control-Allow-Origin: *` – adjust in [`route.ts`](src/app/api/scan/route.ts:1) if you need stricter rules. |
| **Rate-limits** | Add Vercel KV / upstash or middleware token-bucket if you hit abuse. |
| **Cheerio size** | Edge bundle OK for MVP; replace with `@edge-runtime/primitives/html-rewriter` for extreme optimisation. |
| **Custom headers** | Pass `&ua=…` and forward to `fetch` in the handler; or hard-code in the `fetch` init. |
| **Trouble on Windows** | Delete lockfile, reinstall with latest pnpm. Edge Functions still deploy fine – runtime is Linux. |

Happy structured-data hunting 🚀