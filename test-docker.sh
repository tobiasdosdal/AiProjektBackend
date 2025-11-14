#!/bin/bash
# Docker test script as per the guide

set -e

echo "Building Docker image..."
docker build -t aiprojekt-backend:test .

echo "Starting container in background..."
docker run -d --name test-container -p 8080:8080 aiprojekt-backend:test

echo "Waiting for application to start..."
sleep 30

echo "Testing that application responds..."
if curl -f http://localhost:8080/actuator/health; then
    echo "✅ Health check passed!"
else
    echo "❌ Health check failed!"
    docker logs test-container
    docker stop test-container
    docker rm test-container
    exit 1
fi

echo "Cleaning up..."
docker stop test-container
docker rm test-container

echo "✅ Docker test completed successfully!"

