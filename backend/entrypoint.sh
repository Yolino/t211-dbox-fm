#!/bin/sh

set -e

echo "Waiting for PostgreSQL..."
while ! nc -z db 5432; do
  sleep 1
done
echo "PostgreSQL container ready !"

echo "Collecting static Django files..."
python manage.py collectstatic --noinput
echo "Static Django files successfully collected !"
echo "Starting Gunicorn server..."
exec gunicorn --bind 0.0.0.0:8000 --workers 3 --threads 2 --worker-class=gthread --timeout 120 backend.wsgi:application
