FROM slyven/dbox:backend-0.4.0

COPY settings.py /app/backend/settings.py
COPY entrypoint.sh /docker-entrypoint.d/entrypoint.sh
RUN chmod +x /docker-entrypoint.d/entrypoint.sh

EXPOSE 8000
ENTRYPOINT ["/docker-entrypoint.d/entrypoint.sh"]
