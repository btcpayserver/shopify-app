#!/usr/bin/env bash

COMMIT="$(git log -1 --format=%H)"
pushd .
TEMP_DIR=$(mktemp -d)
echo "COMMIT=${COMMIT}"
cd "$TEMP_DIR"
echo "Creating plugin in directory: ${TEMP_DIR}"
cp -rf /app/* "${TEMP_DIR}"
echo "VERSION=$(cat VERSION)"

cp shopify.app.toml.example shopify.app.toml
sed -i "s|APP_NAME|${APP_NAME}|g" shopify.app.toml
sed -i "s|CLIENT_ID|${CLIENT_ID}|g" shopify.app.toml
sed -i "s|PLUGIN_URL|${PLUGIN_URL}|g" shopify.app.toml
sed -i "s|PLUGIN_URL|${PLUGIN_URL}|g" extensions/btcpaycheckout/src/Checkout.jsx
echo "Settings saved"

if shopify app deploy -f --no-color; then
echo "SUCCESS=true"
else
echo "SUCCESS=false"
fi

popd

rm -rf "$TEMP_DIR"