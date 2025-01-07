# Use the official MySQL image
FROM mysql:latest

# Copy initialization scripts to set up the DB on startup, if you have any
COPY ./initdb.d /docker-entrypoint-initdb.d/

# Expose MySQL port
EXPOSE 3011
