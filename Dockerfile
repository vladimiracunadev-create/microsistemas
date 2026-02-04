# Use a specific version for supply chain security
FROM php:8.2.27-apache-bookworm

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
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install gd mysqli pdo pdo_mysql \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Enable Apache mod_rewrite
RUN a2enmod rewrite

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

# Switch back to non-root for security if using a non-privileged port, 
# but Apache on 80 requires root to start.
# Healthcheck for Docker
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

EXPOSE 80

CMD ["apache2-foreground"]
