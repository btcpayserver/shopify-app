# BTCPay Server Shopify App

This is an app that provides a checkout extension to make it possible for Shopify merchants to accept Bitcoin payments using BTCPay Server.

The docker image run a lightweight API in `deploy.sh` running on port `5000`.

This host a single route on `/deploy`, which will build and deploy on shopify server the app.

```json
{
    "cliToken": "PARTNER CLI TOKEN",
    "clientId": "APP_CLIENT_ID",
    "pluginUrl": "BTCPAY_PLUGIN_URL",
    "appName": "APP NAME"
}
```

It streams back the logs of the deployment process to the client.

This server is used by the [BTCPay Server Shopify plugin](https://github.com/btcpayserver/btcpayserver-shopify-plugin) in order to deploy the app.

You can find installation instructions on our official documentation page: [BTCPay Server for Shopify](https://docs.btcpayserver.org/ShopifyV2/)

## Maitainers

The image is hosted on [docker hub](https://hub.docker.com/r/btcpayserver/shopify-app-deployer), to publish a new one, push a new tag to the repository. The github action is set up to create the image and upload it.