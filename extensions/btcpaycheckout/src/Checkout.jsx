import {
  reactExtension,
  BlockStack,
  Button,
  Text,
  useApi,
  useSelectedPaymentOptions
} from "@shopify/ui-extensions-react/checkout";
import { useState } from "react";

// 1. Choose an extension target
export default reactExtension(
  'purchase.thank-you.block.render',
  () => <Extension />,
);

function Extension() {
  const options = useSelectedPaymentOptions();
  const { shop, checkoutToken } = useApi();
  const [isInvoiceSettled, setIsInvoiceSettled] = useState(false);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const hasManualPayment = options.some((option) => option.type.toLowerCase() === 'manualpayment');

  const appUrl = `PLUGIN_URL/checkout?checkout_token=${checkoutToken.current}`;
  const validatePaymentUrl = `PLUGIN_URL/validate-payment?checkout_token=${checkoutToken.current}`;

  const checkPaymentStatus = async () => {
    try {
      const response = await fetch(validatePaymentUrl);
      if (!response.ok) return;

      const data = await response.json();
      if (data.IsInvoiceSettled) {
        setIsInvoiceSettled(true);
        setIsCheckingPayment(false);
      }
    } catch (error) {}
  };


  const startCheckingPayment = () => {
    if (isCheckingPayment) return;

    setIsCheckingPayment(true);
    const interval = setInterval(async () => {
      await checkPaymentStatus();
    }, 4000);
    return () => clearInterval(interval);
  };


  if (!hasManualPayment) return null;

  return (
    <BlockStack>
      <Text>Shop name: {shop.name}</Text>
      {isInvoiceSettled ? (
        <Text size="large" alignment="center" bold>Payment received. Thank you for your order!</Text>
      ) : (
        <>
          <Text size="large" alignment="center" bold>Review and pay using BTCPay Server!</Text>
          <Text>Please review your order and complete the payment using BTCPay Server.</Text>
          <Button to={appUrl} external onPress={startCheckingPayment}>Complete Payment</Button>
        </>
      )}
    </BlockStack>
  );
}
