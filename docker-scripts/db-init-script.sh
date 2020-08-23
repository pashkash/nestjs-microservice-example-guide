#!/bin/bash
set -e
set -o allexport
cd /docker-entrypoint-initdb.d/
source .env

pg_dump --verbose --dbname=postgresql://${POSTGRES_USERNAME}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DATABASE} --schema-only > init.sql

set +o allexport