import {
  reactExtension,
  BlockStack,
  Button,
  Text,
  useApi
} from "@shopify/ui-extensions-react/checkout";

// 1. Choose an extension target
export default reactExtension(
  'purchase.thank-you.block.render',
  () => <Extension />,
);

function Extension() {
  const { shop, checkoutToken } = useApi();
  const appUrl = `PLUGIN_URL/checkout?checkout_token=${checkoutToken.current}`;
  return (
    <>
        <BlockStack>
          <Text>Shop name: {shop.name}</Text>
          <Text size="large" alignment="center" bold>Review and pay using BTCPay Server!</Text>
          <Text>Please review your order and complete the payment using BTCPay Server.</Text>
          <Button to={appUrl} external>Complete Payment</Button>
        </BlockStack>
    </>
  );
}
