#!/bin/sh

echo "Initializing database..."

DB_NAME=$(cat /run/secrets/db_name)
DB_USER=$(cat /run/secrets/db_user)
DJANGO_PASSWORD=$(cat /run/secrets/db_django_password)

psql -U "$DB_USER" -d "$DB_NAME" \
  -v db_name="$DB_NAME" \
  -v django_password="$DJANGO_PASSWORD" \
  -f "/docker-entrypoint-initdb.d/create-django-user.sql"

echo "Database initialized successfully"
