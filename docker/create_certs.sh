#!/bin/sh

cat > san.cnf <<EOF
[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn
req_extensions = req_ext

[dn]
C = US
ST = YourState
L = YourCity
O = YourOrganization
OU = YourDepartment
CN = localhost

[req_ext]
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = keycloak1
DNS.3 = keycloak2
EOF

# Generate a Private Key
openssl genrsa -out server.key 2048

# Generate the Certificate Signing Request (CSR)
openssl req -new -key server.key -out server.csr -config san.cnf

# Generate a Self-Signed Certificate
openssl x509 -req -days 365 -in server.csr -signkey server.key -out server.crt -extensions req_ext -extfile san.cnf


# Convert the certificate and key into a PKCS12 keystore
openssl pkcs12 -export -in server.crt -inkey server.key -out keystore.p12 -name mycert -passout pass:changeit

# import it into a JKS keystore
rm -f certs/keystore.jks
keytool -importkeystore -destkeystore certs/keystore.jks -srckeystore keystore.p12 -srcstoretype PKCS12 -deststorepass changeit -srcstorepass changeit -alias mycert

# Extract the certificate and import it into a truststore
rm -f certs/truststore.p12
keytool -import -trustcacerts -keystore certs/truststore.p12 -storepass changeit -file server.crt -alias mytrustedcert -storetype PKCS12

