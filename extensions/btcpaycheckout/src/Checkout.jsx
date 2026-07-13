import '@shopify/ui-extensions/preact';
import { render } from 'preact';
import { useEffect, useState } from 'preact/hooks';

export default function extension() {
  render(<Extension />, document.body);
}

function Extension() {
  const shop = shopify.shop;
  const checkoutToken = shopify.checkoutToken.value;
  const options = shopify.selectedPaymentOptions.value;
  const translate = shopify.i18n.translate;
  const hasManualPayment = options.some((option) => option.type.toLowerCase() === 'manualpayment');

  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!hasManualPayment || !checkoutToken) return;

    let cancelled = false;
    const appUrl = `PLUGIN_URL/checkout?checkout_token=${checkoutToken}`;
    const MAX_ATTEMPTS = 3;

    const fetchInvoice = async (attempt = 0) => {
      setIsLoading(true);
      try {
        const response = await fetch(`${appUrl}&redirect=false`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (cancelled) return;

        if (response.ok) {
          setIsSuccess(true);
          setIsLoading(false);
        } else if (response.status === 404 && attempt < MAX_ATTEMPTS) {
          setTimeout(() => fetchInvoice(attempt + 1), 1000 * (attempt + 1));
          return;
        } else if (response.status !== 404) {
          const errorText = await response.text();
          setErrorMessage(translate("error.fetch_invoice", { error: errorText || response.statusText }));
          setIsLoading(false);
        } else {
          setErrorMessage(translate("error.fetch_invoice", { error: 'Order not found after retries' }));
          setIsLoading(false);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(translate('error.general', { error: error.message }));
          setIsLoading(false);
        }
      }
    };

    fetchInvoice();
    return () => { cancelled = true; };
  }, [hasManualPayment, checkoutToken]);

  if (!hasManualPayment) return null;

  return (
    <s-box padding="base" border="base" borderRadius="base">
      <s-stack direction="block" gap="base">
        {isLoading && <s-spinner />}
        {!isLoading && errorMessage && (
          <s-text tone="critical" type="strong">{errorMessage}</s-text>
        )}
        {!isLoading && isSuccess && (
          <>
            <s-text>{translate('shop_name')}: {shop.name}</s-text>
            <s-text type="strong">{translate('reviewAndPay')}</s-text>
            <s-text>{translate('reviewOrderMessage')}.</s-text>
            <s-button href={`PLUGIN_URL/checkout?checkout_token=${checkoutToken}`} target="_blank" variant="primary">
              {translate('complete_payment')}
            </s-button>
          </>
        )}
      </s-stack>
    </s-box>
  );
}
