# DIFFERENCE POC — IUIH stack

Self-contained stack: a secured FHIR server (HAPI + FHIR Info Gateway +
Keycloak) **plus** the Vite SMART-EHR-Launcher frontend, all behind a single
HTTPS reverse proxy (Caddy).

- **Primary** FHIR server = this stack's gateway (IUIH).
- **Secondary** FHIR server = the **Mater** stack's public gateway.

## Runtime config (matches `main`)

The frontend is **not** configured at build time. It fetches `/config.json` in
the browser at load (main's `ConfigContext`), so one shared image is configured
per-stack at **deploy** time by mounting files — no `VITE_*`, no per-stack
rebuild:

| Mounted into the frontend         | Source            | Served as                     |
|-----------------------------------|-------------------|-------------------------------|
| `/app/public/config.json`         | `./config.json`   | `/config.json`                |
| `/app/public/branding/.local/`    | `./branding/`     | `/branding/.local/{logo,banner}.svg` |
| `/app/.local/{key,cert}.pem`      | `./certs/server.*`| (TLS for the dev server)      |

`config.json` sets the primary FHIR server (this stack), the `secondaryFhirServer`
(the other org), OAuth (`difference-poc-viewer`), and `branding` (logo/banner +
`stylesheetUrl` → the committed `src/styles/bioc_branding.css`).

## HTTPS everywhere (two ports)

`vite.config.ts` (from `main`) enforces HTTPS, so the frontend serves TLS using
the mounted `.local` cert. Caddy also terminates TLS at the public edge, so the
whole public origin is `https://…` and the OAuth issuer is identical for the
browser and for the gateway's server-side JWKS fetch. The gateway trusts Caddy's
self-signed cert via `certs/truststore.p12` (SAN includes the public host).

A single TCP port can't serve both protocols, so Caddy exposes two:

| Port (`.env`)      | Role                                                        |
|--------------------|-------------------------------------------------------------|
| `HTTP_PORT` (8080) | plain HTTP — **308-redirects** everything to the HTTPS origin (method + path + query preserved) |
| `HTTPS_PORT` (8443)| canonical HTTPS origin — app, `/fhir`, `/auth`              |

So `http://example.iuih.org:8080/…` upgrades to `https://example.iuih.org:8443/…`
instead of the "Client sent an HTTP request to an HTTPS server" error.

## Contents

| Service         | Role                                                        |
|-----------------|-------------------------------------------------------------|
| `proxy`         | Caddy — HTTPS entrypoint (+ HTTP→HTTPS redirect), alias = `SELF_HOST` |
| `frontend`      | Vite dev server (HTTPS); config + branding mounted at deploy |
| `fhir-gateway`  | FHIR Info Gateway (serves FHIR under `/fhir`, HTTPS)        |
| `hapi-server` / `hapi-fhir-postgres` | HAPI FHIR server + its Postgres          |
| `keycloak`      | SMART Keycloak (Wildfly v18, `PROXY_ADDRESS_FORWARDING`)    |
| `smart-config` / `proxy-config` | bundled alvearie/proxy realm bootstrap      |
| `keycloak-init` | registers `DIFFERENCE_POC` realm + viewer client + SMART scopes (kcadm) |

## Configure

- Public hostnames, ports (`HTTP_PORT`/`HTTPS_PORT`), and the OTHER org's URLs
  live in [`.env`](./.env).
- This stack's app config is [`config.json`](./config.json); branding assets are
  in [`branding/`](./branding).
- Add both public hostnames to `/etc/hosts`:
  ```
  127.0.0.1  example.iuih.org example.mater.org
  ```
- Certs are pre-generated (self-signed, SAN = public host). Regenerate with
  `./create_certs.sh example.iuih.org` (needs openssl + keytool, or run it in an
  `eclipse-temurin` container).

## Run

```bash
docker compose up --build
```

Browse to **`SELF_FRONTEND_URL`** (default https://example.iuih.org:8443) and
accept the self-signed cert — or hit http://example.iuih.org:8080 and be
upgraded. Test login: `poc` / `poc` (realm `DIFFERENCE_POC`).

Verified end-to-end over HTTPS: frontend `200`, `/fhir/metadata` `200`,
`/config.json` served, `/fhir/.well-known/smart-configuration` advertises the
HTTPS issuer, banner served, and `/authorize` accepts the viewer client with
both the IUIH and Mater redirect URIs and the `user/*.read` scope.

## Known limitations (POC)

- **Self-signed certs** — browsers and tools must accept them (`curl -k`). Certs
  are committed for out-of-box runs; regenerate for a real deploy.
- **Gateway `ACCESS_CHECKER=list`** expects per-user List-based permissions,
  wired by the bundled `proxy-config` for the legacy `test` realm, **not** for
  `DIFFERENCE_POC`. Authenticated FHIR reads by the `poc` user may 403 until an
  access List is provisioned (or the checker is relaxed for the demo).
- **kcadm/Keycloak version** — `keycloak-init` uses `keycloak:24.0` kcadm against
  the alvearie Wildfly image's `/auth` base path; re-verify if you bump either.
