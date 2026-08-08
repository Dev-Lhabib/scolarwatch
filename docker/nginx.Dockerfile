# ScolarWatch production Nginx image.
#
# The reverse proxy needs the Laravel public/ directory (built Vite assets and
# the index.php front controller) to serve static files directly while it
# proxies PHP to the separate php-fpm `app` container.
#
# The assets are baked in from the already-built production app image. The
# image name is injected via PROD_IMAGE (defaults to the local tag for manual
# builds); the CD pipeline passes the GHCR app image so the proxy is immutable
# and deploy-safe: no shared volumes, no runtime syncing, and never a stale
# build directory.

ARG PROD_IMAGE=scolarwatch:prod

FROM ${PROD_IMAGE} AS assets

FROM nginx:1.27-alpine

COPY docker/nginx/prod.conf /etc/nginx/conf.d/default.conf
COPY --from=assets /var/www/html/public /var/www/html/public
