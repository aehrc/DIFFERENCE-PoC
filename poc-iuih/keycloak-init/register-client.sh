#!/bin/bash
# Registers the DIFFERENCE POC viewer client + a test user in the POC realm on
# THIS stack's Keycloak. The client trusts BOTH frontends' redirect URIs
# (self + other) so the cross-org secondary-server auth flow works: when the
# other org's frontend uses this stack as its SECONDARY FHIR server, its browser
# is redirected back to the other org's /authcallback.
#
# Uses kcadm.sh against the running Keycloak Admin REST API (image-agnostic).
# All inputs come from the environment (see docker-compose.yml / .env).
set -euo pipefail

KC_INTERNAL="${KC_INTERNAL_URL:-http://keycloak:8080/auth}"
KCADM=/opt/keycloak/bin/kcadm.sh

echo "[keycloak-init] waiting for admin API at ${KC_INTERNAL} ..."
until "$KCADM" config credentials \
    --server "$KC_INTERNAL" \
    --realm master \
    --user "$KEYCLOAK_USER" \
    --password "$KEYCLOAK_PASSWORD" 2>/dev/null; do
  sleep 5
done

echo "[keycloak-init] ensuring realm ${POC_REALM}"
"$KCADM" create realms -s realm="$POC_REALM" -s enabled=true 2>/dev/null \
  || echo "[keycloak-init] realm ${POC_REALM} already exists"

# Redirect URIs / web origins cover BOTH frontends (self + other org).
REDIRECT_SELF="${SELF_FRONTEND_URL%/}/authcallback"
REDIRECT_OTHER="${OTHER_FRONTEND_URL%/}/authcallback"
ORIGIN_SELF="${SELF_FRONTEND_URL%/}"
ORIGIN_OTHER="${OTHER_FRONTEND_URL%/}"

echo "[keycloak-init] ensuring public client ${CLIENT_ID}"
CID=$("$KCADM" get clients -r "$POC_REALM" -q clientId="$CLIENT_ID" --fields id --format csv --noquotes 2>/dev/null | head -n1 || true)
if [ -z "$CID" ]; then
  "$KCADM" create clients -r "$POC_REALM" \
    -s clientId="$CLIENT_ID" \
    -s publicClient=true \
    -s standardFlowEnabled=true \
    -s directAccessGrantsEnabled=true \
    -s "redirectUris=[\"${REDIRECT_SELF}\",\"${REDIRECT_OTHER}\"]" \
    -s "webOrigins=[\"${ORIGIN_SELF}\",\"${ORIGIN_OTHER}\"]"
else
  echo "[keycloak-init] updating redirect URIs on existing client ${CLIENT_ID}"
  "$KCADM" update "clients/${CID}" -r "$POC_REALM" \
    -s "redirectUris=[\"${REDIRECT_SELF}\",\"${REDIRECT_OTHER}\"]" \
    -s "webOrigins=[\"${ORIGIN_SELF}\",\"${ORIGIN_OTHER}\"]"
fi

# Re-fetch the client id (needed whether it was just created or already existed).
CID=$("$KCADM" get clients -r "$POC_REALM" -q clientId="$CLIENT_ID" --fields id --format csv --noquotes 2>/dev/null | head -n1 || true)

# SMART-on-FHIR scopes aren't built-in Keycloak scopes, so the realm rejects
# them ("Invalid scopes") unless they exist as client scopes AND are assigned to
# the client. Create each requested SMART scope and attach it as a DEFAULT scope
# so it's always granted. (openid/profile are built-in and already assigned.)
SMART_SCOPES="${SMART_SCOPES:-user/*.read user/*.rs patient/*.read launch launch/patient fhirUser}"
for scope in $SMART_SCOPES; do
  SID=$("$KCADM" get client-scopes -r "$POC_REALM" --fields id,name --format csv --noquotes 2>/dev/null \
        | { while IFS=, read -r _id _name; do [ "$_name" = "$scope" ] && { printf '%s' "$_id"; break; }; done; } || true)
  if [ -z "$SID" ]; then
    echo "[keycloak-init] creating client scope ${scope}"
    "$KCADM" create client-scopes -r "$POC_REALM" \
      -s name="$scope" \
      -s protocol=openid-connect \
      -s 'attributes."include.in.token.scope"=true' \
      -s 'attributes."display.on.consent.screen"=false' >/dev/null
    SID=$("$KCADM" get client-scopes -r "$POC_REALM" --fields id,name --format csv --noquotes 2>/dev/null \
          | { while IFS=, read -r _id _name; do [ "$_name" = "$scope" ] && { printf '%s' "$_id"; break; }; done; } || true)
  fi
  if [ -n "$CID" ] && [ -n "$SID" ]; then
    "$KCADM" update "clients/${CID}/default-client-scopes/${SID}" -r "$POC_REALM" 2>/dev/null \
      && echo "[keycloak-init]   assigned scope ${scope}" \
      || echo "[keycloak-init]   scope ${scope} already assigned"
  fi
done

# SMART fhirUser claim: emit `fhirUser` in the id_token from a user attribute so
# the launcher defaults the User launch context to the authenticated user. Maps
# user attribute `fhirUser` -> claim `fhirUser` (String) on the viewer client.
FHIR_USER_VALUE="${FHIR_USER_VALUE:-Practitioner/poc}"
if [ -n "$CID" ]; then
  MID=$("$KCADM" get "clients/${CID}/protocol-mappers/models" -r "$POC_REALM" --fields id,name --format csv --noquotes 2>/dev/null \
        | { while IFS=, read -r _id _name; do [ "$_name" = "fhirUser" ] && { printf '%s' "$_id"; break; }; done; } || true)
  if [ -z "$MID" ]; then
    echo "[keycloak-init] adding fhirUser protocol mapper to ${CLIENT_ID}"
    "$KCADM" create "clients/${CID}/protocol-mappers/models" -r "$POC_REALM" \
      -s name=fhirUser \
      -s protocol=openid-connect \
      -s protocolMapper=oidc-usermodel-attribute-mapper \
      -s 'config."user.attribute"=fhirUser' \
      -s 'config."claim.name"=fhirUser' \
      -s 'config."jsonType.label"=String' \
      -s 'config."id.token.claim"=true' \
      -s 'config."access.token.claim"=true' \
      -s 'config."userinfo.token.claim"=true' >/dev/null \
      && echo "[keycloak-init]   fhirUser mapper added" || echo "[keycloak-init]   fhirUser mapper add failed"
  else
    echo "[keycloak-init] fhirUser protocol mapper already present"
  fi
fi

echo "[keycloak-init] ensuring test user ${POC_USER}"
"$KCADM" create users -r "$POC_REALM" -s username="$POC_USER" -s enabled=true 2>/dev/null \
  || echo "[keycloak-init] user ${POC_USER} already exists"
"$KCADM" set-password -r "$POC_REALM" --username "$POC_USER" --new-password "$POC_PASS"

# Link the test user to the seeded Practitioner (drives the fhirUser claim).
UID_POC=$("$KCADM" get users -r "$POC_REALM" -q username="$POC_USER" --fields id --format csv --noquotes 2>/dev/null | head -n1 || true)
if [ -n "$UID_POC" ]; then
  "$KCADM" update "users/${UID_POC}" -r "$POC_REALM" -s "attributes.fhirUser=[\"${FHIR_USER_VALUE}\"]" \
    && echo "[keycloak-init] set ${POC_USER} fhirUser=${FHIR_USER_VALUE}"
fi

echo "[keycloak-init] done."
echo "[keycloak-init]   realm:      ${POC_REALM}"
echo "[keycloak-init]   client:     ${CLIENT_ID}"
echo "[keycloak-init]   redirects:  ${REDIRECT_SELF} , ${REDIRECT_OTHER}"
echo "[keycloak-init]   test login: ${POC_USER} / ${POC_PASS}  (fhirUser=${FHIR_USER_VALUE})"
