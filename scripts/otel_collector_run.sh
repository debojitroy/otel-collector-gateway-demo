#!/bin/bash

docker run -d -p 4317:4317 -p 4318:4318 -p 9464:9464 \
 -v $(pwd)/config.yaml:/etc/otelcol-contrib/config.yaml:ro \
 -e AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID \
 -e AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY \
 -e DD_API_KEY=$DD_API_KEY \
 -e DD_SITE=$DD_SITE \
 -e NR_API_KEY=$NR_API_KEY \
 otel/opentelemetry-collector-contrib:latest