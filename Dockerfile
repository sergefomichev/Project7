FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache tini

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig*.json vite.config.ts tailwind.config.js postcss.config.js ./
COPY index.html ./
COPY public ./public
COPY src ./src

RUN npm run build

FROM nginx:stable-alpine AS runner

LABEL org.opencontainers.image.title="The Only Trusted"
LABEL org.opencontainers.image.description="A premium digital experience — Brand DNA alignment platform"
LABEL org.opencontainers.image.authors="Sergei"
LABEL org.opencontainers.image.source="https://github.com/your-org/the-only-trusted"

RUN apk add --no-cache tini

# Create nginx cache directories with proper permissions
RUN mkdir -p /var/cache/nginx /var/run && chown -R nginx:nginx /var/cache/nginx /var/run

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["nginx", "-g", "daemon off;"]
