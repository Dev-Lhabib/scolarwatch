# syntax=docker/dockerfile:1

#
# Production multi-stage build
#
#   Stage 1 (composer) : PHP production dependencies -> /var/www/html/vendor
#   Stage 2 (node)     : frontend assets               -> /var/www/html/public/build
#   Stage 3 (runtime)  : minimal php-fpm 8.4 Alpine image
#
# The Node stage needs PHP because @laravel/vite-plugin-wayfinder runs
# `php artisan wayfinder:generate` during `vite build` (it aborts the build on
# failure). It reuses the Composer stage's vendor to keep a single install.
#

# ---------- Stage 1: Composer (PHP dependencies) ----------
FROM composer:2 AS composer

WORKDIR /var/www/html

COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --no-interaction \
    --no-progress \
    --prefer-dist \
    --no-scripts \
    --optimize-autoloader

# ---------- Stage 2: Node (frontend assets) ----------
FROM php:8.4-cli-alpine AS node

ENV APP_ENV=production

RUN apk add --no-cache nodejs npm

WORKDIR /var/www/html

COPY --from=composer /var/www/html/vendor ./vendor
COPY package.json package-lock.json .npmrc ./
RUN npm ci

COPY . .

# A throwaway APP_KEY is generated per build so the framework can boot during
# package discovery and Wayfinder generation. The real APP_KEY is supplied at
# container runtime via docker-compose.prod.yml's env_file and is never baked
# into the image.
RUN APP_KEY="$(php artisan key:generate --show)" \
    && php artisan package:discover --ansi \
    && php artisan wayfinder:generate --ansi \
    && npm run build

# ---------- Stage 3: Production Runtime ----------
FROM php:8.4-fpm-alpine AS runtime

ENV APP_ENV=production \
    APP_DEBUG=false

RUN apk add --no-cache su-exec \
    && addgroup -g 1000 -S app \
    && adduser -u 1000 -S -G app app

# Runtime PHP extensions (pdo_mysql, redis, intl, opcache, pcntl, zip).
# Runtime shared libs (icu-libs, libzip) are installed as regular packages so
# they survive the build-deps purge.
RUN set -eux; \
    apk add --no-cache icu-libs libzip; \
    apk add --no-cache --virtual .build-deps \
        $PHPIZE_DEPS \
        icu-dev \
        libzip-dev; \
    docker-php-ext-install -j"$(nproc)" \
        pdo_mysql \
        pcntl \
        intl \
        zip \
        opcache; \
    pecl install redis; \
    docker-php-ext-enable redis; \
    apk del .build-deps; \
    rm -rf /tmp/pear

# Base PHP settings
RUN { \
        echo 'memory_limit=256M'; \
        echo 'expose_php=Off'; \
    } > /usr/local/etc/php/conf.d/zz-app.ini

# OPcache (production, immutable filesystem)
RUN { \
        echo 'opcache.enable=1'; \
        echo 'opcache.enable_cli=0'; \
        echo 'opcache.memory_consumption=128'; \
        echo 'opcache.interned_strings_buffer=8'; \
        echo 'opcache.max_accelerated_files=10000'; \
        echo 'opcache.validate_timestamps=0'; \
        echo 'opcache.revalidate_freq=0'; \
        echo 'opcache.fast_shutdown=1'; \
    } > /usr/local/etc/php/conf.d/zz-opcache.ini

# php-fpm: run as app user, listen on port 9000 (FastCGI). Logs go to files in
# storage/logs (writable after entrypoint chown) because a non-root master
# cannot reopen the root-owned stdout pipe used by the base docker.conf.
RUN { \
        echo '[global]'; \
        echo 'error_log = /var/www/html/storage/logs/php-fpm.log'; \
    } > /usr/local/etc/php-fpm.d/zz-global.conf; \
    { \
        echo '[www]'; \
        echo 'user = app'; \
        echo 'group = app'; \
        echo 'listen = 9000'; \
        echo 'pm = dynamic'; \
        echo 'pm.max_children = 10'; \
        echo 'pm.start_servers = 2'; \
        echo 'pm.min_spare_servers = 1'; \
        echo 'pm.max_spare_servers = 5'; \
        echo 'pm.max_requests = 500'; \
        echo 'clear_env = no'; \
        echo 'catch_workers_output = yes'; \
        echo 'access.log = /var/www/html/storage/logs/php-fpm-access.log'; \
        echo 'php_admin_flag[log_errors] = on'; \
    } > /usr/local/etc/php-fpm.d/zz-www.conf

WORKDIR /var/www/html

COPY . .
COPY --from=composer /var/www/html/vendor ./vendor
COPY --from=node /var/www/html/bootstrap/cache ./bootstrap/cache
COPY --from=node /var/www/html/public/build ./public/build

# Entrypoint: ensure writable storage/bootstrap on mounted volumes, then run
# php-fpm as the non-root `app` user.
RUN printf '#!/bin/sh\nset -e\n\nmkdir -p storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs bootstrap/cache\nif [ "$(id -u)" = 0 ]; then\n    chown -R app:app storage bootstrap/cache 2>/dev/null || true\n    exec su-exec app:app "$@"\nfi\nexec "$@"\n' > /usr/local/bin/docker-entrypoint \
    && chmod +x /usr/local/bin/docker-entrypoint

EXPOSE 9000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD php -r "exit(@fsockopen('127.0.0.1', 9000) ? 0 : 1);"

ENTRYPOINT ["docker-entrypoint"]
CMD ["php-fpm"]
