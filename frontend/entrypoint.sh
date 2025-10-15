#!/bin/sh
# Exit script on any error
set -e

# Path to the main JavaScript file, adjust if necessary
JS_FILE=$(find /usr/share/nginx/html/assets -name "index-*.js")

# Check if the API_BASE_URL is set, otherwise use a default
# This value will come from the Kubernetes Deployment 'env' block
export API_BASE_URL=${VITE_API_URL:-/api}

echo "Configuring API URL to: $API_BASE_URL"

# Use sed to replace the placeholder with the actual value
sed -i "s|__API_BASE_URL__|$API_BASE_URL|g" $JS_FILE

# Execute the original command (nginx)
# This is crucial, `exec` replaces the shell process with the nginx process
exec "$@"
