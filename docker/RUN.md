
To set up:

./create_certs.sh

To spin up:

sudo docker compose -f docker-compose-iuih.yml up -d keycloak1
sleep 60
sudo docker compose -f docker-compose-iuih.yml up -d

