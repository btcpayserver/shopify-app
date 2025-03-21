import {
  reactExtension,
  BlockStack,
  Button,
  Text,
  useApi,
  Spinner,
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
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const hasManualPayment = options.some((option) => option.type.toLowerCase() === 'manualpayment');
  const appUrl = `PLUGIN_URL/checkout?checkout_token=${checkoutToken.current}`;

  useEffect(() => {
    if (!hasManualPayment) return;
    const fetchInvoice = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${appUrl}&redirect=false`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (response.ok) {
          setIsSuccess(true);
        }
      } catch (error) {} 
      finally {
        setIsLoading(false);
      }
    };
    const timer = setTimeout(fetchInvoice, 1000);
    return () => clearTimeout(timer)
  }, [hasManualPayment]);

  if (!hasManualPayment) return null;

  return (
    <BlockStack>
      {isLoading && <Spinner />}
      {!isLoading && isSuccess && (
        <>
          <Text>Shop name: {shop.name}</Text>
          <Text size="large" alignment="center" bold>Review and pay using BTCPay Server!</Text>
          <Text>Please review your order and complete the payment using BTCPay Server.</Text>
          <Button to={appUrl} external>Complete Payment</Button>
        </>
      )}
    </BlockStack>
  );
}
