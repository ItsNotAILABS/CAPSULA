# capsula-canister-app — Cloudflare surface for the browser WASM canister

**Status: scaffolding only. Nothing is deployed and no Cloudflare account is
connected.** This directory holds the deployment config the avatar-phone app
will use once its code lands. The existing `cloudflare/wrangler.toml`
(static Pages config) is untouched.

## What lives here

- `wrangler.toml` — Pages project `capsula-canister-app` + `[[r2_buckets]]`
  binding `WEIGHTS = "capsula-weights"` (usable from Pages Functions).
- `cors.json` — sample R2 CORS policy so browsers can `fetch()` weight shards
  (including `Range` requests) from the R2 public URL.

## Layout convention (R2)

```
capsula-weights/
  wasm/<canister-id>/<version>/core.wasm
  weights/<canister-id>/<version>/<shard-name>.bin
```

Manifests are served from the Pages site itself:

```
https://<pages-domain>/canister/<canister-id>.json
```

The manifest's `wasmUrl` / shard `url` fields point at the R2 public URL
(custom domain or `*.r2.dev`) plus the key path above.

## Bring-up commands

Run these once the user's Cloudflare account is connected. `<ACCOUNT_ID>` is a
placeholder — get the real one from the Cloudflare dashboard (domain overview
page, bottom right).

```bash
# 1. Authenticate (opens a browser)
npx wrangler login

# 2. Create the weights bucket
npx wrangler r2 bucket create capsula-weights

# 3. CORS: dashboard -> R2 -> capsula-weights -> Settings -> CORS Policy,
#    paste the contents of cors.json and save. (The dashboard path is the
#    reliable one for CORS; there is no stable one-shot wrangler command.)
#    Required so the page can fetch shards cross-origin with Range headers.

# 4. Public access: dashboard -> R2 -> capsula-weights -> Settings ->
#    Public Access -> either allow the r2.dev subdomain or connect a custom
#    domain (e.g. weights.<your-domain>). Note the public base URL; it goes
#    into the manifest's wasmUrl / shard urls.

# 5. Upload a canister's files (example: canister id "avatar-phone", v0.1.0)
npx wrangler r2 object put capsula-weights/wasm/avatar-phone/0.1.0/core.wasm \
  --file ./core.wasm
npx wrangler r2 object put capsula-weights/weights/avatar-phone/0.1.0/shard-0.bin \
  --file ./shard-0.bin
# Then compute sha256 of each uploaded file and write the manifest
# (see packages/capsula-canister/schema/canister.schema.json), and serve it at
# /canister/avatar-phone.json on the Pages site.

# 6. Create the Pages project and deploy (after the avatar-phone app lands
#    and has a build output directory)
npx wrangler pages project create capsula-canister-app
npx wrangler pages deploy <build-output-dir> --project-name=capsula-canister-app
```

## Not yet

- No Cloudflare account connected — none of the above has been run.
- No `functions/` directory yet. Reading the `WEIGHTS` binding (e.g. for
  signed URLs or a manifest endpoint) requires a Pages Function; add one when
  the app needs server-side behavior.
- `pages_build_output_dir` is intentionally unset until the avatar-phone app
  code arrives and declares its build output.
