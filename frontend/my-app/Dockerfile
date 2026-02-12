# ============================
# 1. Build React App (Vite)
# ============================
FROM node:18-alpine AS build

WORKDIR /app

# Copy package.json + package-lock.json
COPY package*.json ./

# Cài dependencies
RUN npm install

# Copy toàn bộ source (bao gồm .env.production)
COPY . .

# Build với mode production (sẽ tự động đọc .env.production)
RUN npm run build

# ============================
# 2. Serve với Nginx
# ============================
FROM nginx:alpine

# Optimize Nginx for small container
RUN echo 'user  nginx; \
    worker_processes  1; \
    error_log  /var/log/nginx/error.log warn; \
    pid        /var/run/nginx.pid; \
    events { \
    worker_connections  1024; \
    } \
    http { \
    include       /etc/nginx/mime.types; \
    default_type  application/octet-stream; \
    log_format  main  "$remote_addr - $remote_user [$time_local] \\"$request\\" " \
    "$status $body_bytes_sent \\"$http_referer\\" " \
    "\\"$http_user_agent\\" \\"$http_x_forwarded_for\\""; \
    access_log  /var/log/nginx/access.log  main; \
    sendfile        on; \
    keepalive_timeout  65; \
    include /etc/nginx/conf.d/*.conf; \
    }' > /etc/nginx/nginx.conf

# Copy built app
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]