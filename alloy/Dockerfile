FROM grafana/alloy:v1.8.3

RUN apt-get update && apt-get install -y -q curl

CMD ["run", "--server.http.listen-addr=0.0.0.0:12345", "--server.http.ui-path-prefix=/alloy", "--storage.path=/var/lib/alloy/data", "/etc/alloy/config.alloy"]
