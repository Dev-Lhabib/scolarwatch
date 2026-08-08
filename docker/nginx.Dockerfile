# ScolarWatch production Nginx image.
#
# The reverse proxy needs the Laravel public/ directory (built Vite assets and
# the index.php front controller) to serve static files directly while it
# proxies PHP to the separate php-fpm `app` container.
#
# The assets are baked in from the already-built scolarwatch:prod image (compose
# builds services in dependency order, so this image is built after the app).
# This keeps the proxy immutable and deploy-safe: no shared volumes, no runtime
# syncing, and never a stale build directory.

FROM scolarwatch:prod AS assets

FROM nginx:1.27-alpine

COPY docker/nginx/prod.conf /etc/nginx/conf.d/default.conf
COPY --from=assets /var/www/html/public /var/www/html/public
