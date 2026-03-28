import {
  reactExtension,
  BlockStack,
  Button,
  Text,
  useApi,
  Spinner,
  useTranslate,
  useSelectedPaymentOptions
} from "@shopify/ui-extensions-react/checkout";
import { useEffect, useState } from "react";

// 1. Choose an extension target
export default reactExtension(
  'purchase.thank-you.block.render',
  () => <Extension />,
);

function Extension() {
  const translate = useTranslate();
  const options = useSelectedPaymentOptions();
  const { shop, checkoutToken } = useApi();
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
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
        else if (response.status !== 404) {
          const errorText = await response.text();
          setErrorMessage(translate("error.fetch_invoice", { error: errorText || response.statusText }));
        }
      } catch (error) {
        setErrorMessage(translate("error.general", { error: error.message }));
      }
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
      {!isLoading && errorMessage && (
        <Text size="large" appearance="critical">{errorMessage}</Text>
      )}
      {!isLoading && isSuccess && (
        <>
          <Text>{translate("shop_name")}: {shop.name}</Text>
          <Text size="large" alignment="center" bold>{translate("reviewAndPay")}</Text>
          <Text>{translate("reviewOrderMessage")}.</Text>
          <Button to={appUrl} external>{translate("complete_payment")}</Button>
        </>
      )}
    </BlockStack>
  );
}
