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

# Copy built app
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]