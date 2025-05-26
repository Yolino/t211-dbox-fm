FROM slyven/dbox:backend-0.6.2

COPY settings.py /app/backend/settings.py
COPY entrypoint.sh /docker-entrypoint.d/entrypoint.sh
RUN chmod +x /docker-entrypoint.d/entrypoint.sh

RUN apk add curl

EXPOSE 8000
ENTRYPOINT ["/docker-entrypoint.d/entrypoint.sh"]
