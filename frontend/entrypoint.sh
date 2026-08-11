#!/bin/sh
# Exit script on any error
set -e

# Grab the environment variable passed by the Kubernetes Deployment.
# If K8s didn't pass one, fallback to the relative path "/api"
export API_BASE_URL=${VITE_API_URL:-/api}

echo "Injecting API URL into React build: $API_BASE_URL"

# Search all JS files in Nginx's serving directory and replace the exact placeholder
find /usr/share/nginx/html -type f -name "*.js" | while read -r JS_FILE; do
  sed -i "s|__VITE_API_URL__|$API_BASE_URL|g" "$JS_FILE"
done

# Execute the original container command (nginx -g 'daemon off;')
exec "$@"
