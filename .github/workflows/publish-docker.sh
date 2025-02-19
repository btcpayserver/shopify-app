#!/usr/bin/env bash

TAG="${GITHUB_REF#refs/tags/}"

sudo docker buildx create --use
sudo docker buildx build \
    -t "btcpayserver/shopify-app-deployer:${TAG}" \
    --platform linux/amd64,linux/arm64,linux/arm/v7 \
    --push .
    