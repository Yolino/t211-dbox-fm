FROM python:3.13-alpine
WORKDIR /app

ENV PYTHONUNBUFFERED 1

RUN apk add --no-cache netcat-openbsd ffmpeg libmagic

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

RUN chmod +x entrypoint.sh

EXPOSE 8000
ENTRYPOINT ["/app/entrypoint.sh"]
