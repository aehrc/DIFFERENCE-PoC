FROM docker.io/library/maven:3.9.12-eclipse-temurin-17 AS build-health
WORKDIR /tmp/hapi-fhir-jpaserver-starter

COPY HealthCheck.java /app/HealthCheck.java
RUN javac /app/HealthCheck.java

FROM hapiproject/hapi:latest as default

COPY --chown=nonroot:nonroot --from=build-health /app/HealthCheck.class /app
