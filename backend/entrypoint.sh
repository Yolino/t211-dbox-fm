#!/bin/sh

set -e

echo "Waiting for PostgreSQL..."
while ! nc -z db 5432; do
  sleep 1
done
echo "PostgreSQL container ready !"

echo "Running Django migrations..."
python manage.py makemigrations --no-input
echo "Running database migrations..."
python manage.py migrate --no-input

echo "Starting Django server..."
exec python manage.py runserver 0.0.0.0:8000
