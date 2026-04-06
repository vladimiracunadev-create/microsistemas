# Use a specific version for supply chain security
FROM php:8.5.4-apache-bookworm

# Security: Set working directory
WORKDIR /var/www/html

# Install system dependencies and PHP extensions
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    zip \
    unzip \
    git \
    curl \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install gd mysqli pdo pdo_mysql \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Enable Apache modules
RUN a2enmod rewrite headers

# Production configuration
RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"

# Copy application source
COPY --chown=www-data:www-data . /var/www/html/

# Install Composer securely
COPY --from=composer:2.8 /usr/bin/composer /usr/bin/composer

# Install PHP dependencies as non-root (if possible)
USER www-data
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Security: Revert to root for final setup then switch back if needed 
# Apache by default needs root to bind to port 80, but we can change that or keep it standard 
# if we use a reverse proxy. For now, we use a production-ready entrypoint.
USER root

# Adjust permissions for Apache (more granular)
RUN find /var/www/html -type d -exec chmod 755 {} \; \
    && find /var/www/html -type f -exec chmod 644 {} \; \
    && chown -R www-data:www-data /var/www/html/vendor

# Switch Apache to non-privileged port 8080 so it can run as www-data (no root needed).
# Also enable AllowOverride All so .htaccess security headers are applied.
RUN sed -i 's/^Listen 80$/Listen 8080/' /etc/apache2/ports.conf \
    && sed -i 's/<VirtualHost \*:80>/<VirtualHost *:8080>/' /etc/apache2/sites-available/000-default.conf \
    && sed -i 's|</VirtualHost>|    <Directory /var/www/html>\n        AllowOverride All\n        Require all granted\n    </Directory>\n</VirtualHost>|' \
        /etc/apache2/sites-available/000-default.conf \
    && mkdir -p /var/run/apache2 /var/log/apache2 \
    && chown -R www-data:www-data /var/run/apache2 /var/log/apache2

# Run as non-root
USER www-data

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/ || exit 1

EXPOSE 8080

CMD ["apache2-foreground"]
