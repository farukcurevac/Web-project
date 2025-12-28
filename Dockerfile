# Dockerfile to run the PHP backend on DigitalOcean App Platform
# Uses PHP 8.2 CLI with built-in server (suitable for course deployment)

FROM php:8.2-cli

# Install system tools needed during build (curl for Composer installer, unzip/git for composer dist)
RUN apt-get update \
	&& apt-get install -y --no-install-recommends curl unzip git \
	&& rm -rf /var/lib/apt/lists/*

# Install MySQL PDO extension
RUN docker-php-ext-install pdo pdo_mysql

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Create app directory and copy source
WORKDIR /app
COPY backend /app/backend

# Install backend dependencies
WORKDIR /app/backend
ENV COMPOSER_ALLOW_SUPERUSER=1
RUN composer install --no-dev --prefer-dist --no-interaction --no-progress

# Ensure we are in the repo root for the run command
WORKDIR /app

# App Platform sets PORT; fall back to 8080 locally
ENV PORT=8080

# Start PHP built-in server, serve the REST app as docroot with index router
# This serves files from backend/rest and routes requests to backend/rest/index.php
CMD ["sh", "-c", "php -S 0.0.0.0:${PORT:-8080} -t backend/rest backend/rest/index.php"]
