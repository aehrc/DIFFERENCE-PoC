#!/bin/sh
# Regenerate the Keycloak TLS keystore/truststore for THIS stack.
# Pre-generated certs are committed so the stack runs out-of-box, but they only
# cover localhost/keycloak. Regenerate with your real public host in the SAN
# before doing browser-based OAuth over TLS.
#
# Usage:  ./create_certs.sh [PUBLIC_HOST]
#   PUBLIC_HOST defaults to example.mater.org
set -e
PUBLIC_HOST="${1:-example.mater.org}"
cd "$(dirname "$0")"

cat > certs/san.cnf <<EOF
[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn
req_extensions = req_ext

[dn]
C = AU
ST = QLD
L = Brisbane
O = DIFFERENCE
OU = POC
CN = ${PUBLIC_HOST}

[req_ext]
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = keycloak
DNS.3 = ${PUBLIC_HOST}
DNS.4 = fhir-gateway
DNS.5 = frontend
EOF

cd certs
openssl genrsa -out server.key 2048
openssl req -new -key server.key -out server.csr -config san.cnf
openssl x509 -req -days 365 -in server.csr -signkey server.key -out server.crt -extensions req_ext -extfile san.cnf
openssl pkcs12 -export -in server.crt -inkey server.key -out keystore.p12 -name mycert -passout pass:changeit

rm -f keystore.jks truststore.p12
keytool -importkeystore -destkeystore keystore.jks -srckeystore keystore.p12 -srcstoretype PKCS12 -deststorepass changeit -srcstorepass changeit -alias mycert
keytool -import -trustcacerts -keystore truststore.p12 -storepass changeit -file server.crt -alias mytrustedcert -storetype PKCS12 -noprompt
echo "certs regenerated for CN=${PUBLIC_HOST}"
