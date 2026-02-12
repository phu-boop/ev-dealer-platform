#!/bin/sh
# Replace PORT placeholder in nginx config with actual PORT from environment
sed -i "s/listen 80;/listen ${PORT:-80};/g" /etc/nginx/conf.d/default.conf

# Start nginx
exec nginx -g "daemon off;"
