### BUILD CADDY
FROM golang AS caddy-builder

RUN apt-get update \
    && apt-get -y --no-install-recommends install \
    gnupg debian-keyring debian-archive-keyring apt-transport-https curl ca-certificates

RUN curl -1sLf 'https://dl.cloudsmith.io/public/caddy/xcaddy/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-xcaddy-archive-keyring.gpg
RUN curl -1sLf 'https://dl.cloudsmith.io/public/caddy/xcaddy/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-xcaddy.list

RUN apt-get update \
    && apt-get -y --no-install-recommends install \
    xcaddy \
    && apt-get clean; \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* /usr/share/doc/*

RUN xcaddy build \
    --with github.com/baldinof/caddy-supervisor \
    --output /caddy

### BUILD CLIENT
FROM oven/bun:debian AS dist-builder

COPY . .

RUN bun i && bun run prod

### COMPOSER INSTALL
FROM php:cli as vendor-builder
COPY --from=composer:latest /usr/bin/composer /usr/local/bin/composer

RUN apt-get update \
    && apt-get -y --no-install-recommends install \
    unzip \
    && apt-get clean; \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* /usr/share/doc/*

COPY composer.json composer.json
COPY composer.lock composer.lock

RUN COMPOSER_ALLOW_SUPERUSER=1 composer install -o

### FINAL IMAGE
FROM php:cli
#COPY --from=composer:latest /usr/bin/composer /usr/local/bin/composer
COPY --from=oven/bun:debian /usr/local/bin/bun /usr/local/bin/bun
COPY --from=caddy-builder /caddy /usr/local/bin/caddy
COPY --from=dist-builder /home/bun/app/dist /server/dist
COPY --from=vendor-builder /vendor /server/vendor
WORKDIR /server

COPY server.php server.php
COPY server.ts server.ts
COPY index.html index.html
COPY Caddyfile Caddyfile




EXPOSE 9900 9912

CMD [ "caddy", "run" ]
