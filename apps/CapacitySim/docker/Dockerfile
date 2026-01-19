# Servir la UI y disponer de Python para CLI
FROM python:3.11-slim

RUN apt-get update && apt-get install -y nginx && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY app /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY scripts /app/scripts
COPY app/data /app/app_data

# Dependencias opcionales (locust)
RUN pip install --no-cache-dir locust

EXPOSE 80
CMD service nginx start && tail -f /var/log/nginx/access.log
