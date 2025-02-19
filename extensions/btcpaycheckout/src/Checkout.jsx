import {
  reactExtension,
  BlockStack,
  Button,
  Text,
  useApi,
  useSelectedPaymentOptions
} from "@shopify/ui-extensions-react/checkout";
import { useEffect, useState } from "react";

// 1. Choose an extension target
export default reactExtension(
  'purchase.thank-you.block.render',
  () => <Extension />,
);

function Extension() {
  const options = useSelectedPaymentOptions();
  const { shop, checkoutToken } = useApi();
  const [hasManualPayment, setHasManualPayment] = useState(false);

  
  useEffect(() => { 
    const hasManualPaymentOption = options.some((option) => option.type.toLowerCase() === 'manualpayment');
    setHasManualPayment(hasManualPaymentOption);
  }, [options]);

  const appUrl = `PLUGIN_URL/checkout?checkout_token=${checkoutToken.current}`;

  if (!hasManualPayment) {
    return null;
  }

  return (
    <BlockStack>
      <Text>Shop name: {shop.name}</Text>
      <Text size="large" alignment="center" bold>Review and pay using BTCPay Server!</Text>
      <Text>Please review your order and complete the payment using BTCPay Server.</Text>
      <Button to={appUrl} external>Complete Payment</Button>
    </BlockStack>
  );
}
