FROM postgres:alpine

COPY create-django-user.sql /docker-entrypoint-initdb.d/create-django-user.sql
COPY init-db.sh /docker-entrypoint-initdb.d/
RUN chmod +x /docker-entrypoint-initdb.d/init-db.sh
