# DIFFERENCE POC — dual cross-org stacks

Two self-contained stacks demonstrating the cross-org SMART-EHR-Launcher: each
org runs its own secured FHIR server + frontend behind an HTTPS reverse proxy,
and each frontend reads the **other** org as its secondary FHIR server.

| Dir          | Org  | Canonical HTTPS origin           | HTTP (redirects) | Secondary |
|--------------|------|----------------------------------|------------------|-----------|
| [`poc-iuih`](./poc-iuih)   | IUIH  | `https://example.iuih.org:8443`  | `:8080` | Mater |
| [`poc-mater`](./poc-mater) | Mater | `https://example.mater.org:8543` | `:8085` | IUIH  |

Each dir is self-contained (compose, `.env`, `config.json`, branding assets,
Caddy config, certs, Keycloak init, HAPI healthcheck build). See per-dir READMEs.

## Config model (matches `main`)

Built on `main`'s runtime config: the frontend fetches `/config.json` in the
browser at load, so the **same image** is configured per-stack at **deploy time**
by mounting `config.json` + branding assets (+ the TLS cert `vite.config`
enforces). No `VITE_*` env, no per-stack rebuild.

## Architecture

Each stack fronts frontend + gateway + Keycloak with one Caddy proxy. It serves
**HTTPS** on the canonical port (path-routed: `/` → frontend, `/fhir/*` →
gateway, `/auth/*` → Keycloak) and a plain-**HTTP** port that 308-redirects to
the HTTPS origin (so `http://…` upgrades instead of erroring). The proxy carries
a docker network alias equal to the public hostname, so the gateway resolves the
OAuth issuer to the proxy internally while the browser resolves it via
`/etc/hosts` — one HTTPS issuer on both sides.

## Cross-org handshake

Each Keycloak registers the viewer client (`difference-poc-viewer`, realm
`DIFFERENCE_POC`, SMART scopes incl. `user/*.read`) with redirect URIs for
**both** frontends, so IUIH's browser can auth against Mater's Keycloak (back to
IUIH's `/authcallback`) when using Mater as secondary — and vice-versa.

## One-time host setup

```
# /etc/hosts
127.0.0.1  example.iuih.org example.mater.org
```

## Bring both up

Host ports are deconflicted (IUIH `:8443` HTTPS / `:8080` HTTP, Mater `:8543` /
`:8085`), so both run on one machine:

```bash
(cd poc-iuih  && docker compose up --build -d)
(cd poc-mater && docker compose up --build -d)
```

Open each public origin (accept the self-signed cert), log in `poc` / `poc`.

Status: IUIH verified end-to-end over HTTPS (config.json served, HTTPS issuer
discovery, branding, OAuth client + cross-org redirect URIs + SMART scope).
See per-dir "Known limitations" (self-signed certs, `ACCESS_CHECKER=list` for the
POC realm, kcadm/Keycloak version).
