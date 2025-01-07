# Use the official PostgreSQL image (https://hub.docker.com/_/mysql)
FROM mysql:latest

# Copy initialization scripts (if any)
COPY ./initdb.d /docker-entrypoint-initdb.d/

# Expose MySQL port
EXPOSE 3011
