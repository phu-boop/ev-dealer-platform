#!/bin/sh
HOST="$1"
PORT="$2"
shift 2

echo "Waiting for $HOST:$PORT..."
while ! nc -z "$HOST" "$PORT"; do
  sleep 2
done

echo "$HOST:$PORT is available, running command..."
exec "$@"
