import '@shopify/ui-extensions/preact';
import { render } from 'preact';
import { useEffect, useState } from 'preact/hooks';

import { fetchInvoiceWithSingleSafeRetry } from './invoice-retry.mjs';

const CHECKOUT_TOKEN_WAIT_MS = 10000;

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
  const [successfulCheckoutToken, setSuccessfulCheckoutToken] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!hasManualPayment) return;

    let cancelled = false;
    let retryTimer;
    let resolvePendingDelay;

    setIsLoading(true);
    setSuccessfulCheckoutToken('');
    setErrorMessage('');

    if (!checkoutToken) {
      retryTimer = setTimeout(() => {
        if (cancelled) return;
        setErrorMessage(translate('error.checkout_not_ready'));
        setIsLoading(false);
      }, CHECKOUT_TOKEN_WAIT_MS);

      return () => {
        cancelled = true;
        clearTimeout(retryTimer);
      };
    }

    const appUrl = `PLUGIN_URL/checkout?checkout_token=${encodeURIComponent(checkoutToken)}`;

    const sleep = (delayMs) => new Promise((resolve) => {
      resolvePendingDelay = resolve;
      retryTimer = setTimeout(() => {
        retryTimer = undefined;
        resolvePendingDelay = undefined;
        resolve();
      }, delayMs);
    });

    const fetchInvoice = async () => {
      const result = await fetchInvoiceWithSingleSafeRetry({
        request: () => fetch(`${appUrl}&redirect=false`, {
          method: 'GET',
        }),
        sleep,
        isCancelled: () => cancelled,
      });

      if (cancelled || result.type === 'cancelled') return;

      if (result.type === 'success') {
        setSuccessfulCheckoutToken(checkoutToken);
        setIsLoading(false);
        return;
      }

      const safeError = result.type === 'http_failure'
        ? `${result.response.status} ${result.response.statusText}`.trim()
        : translate('error.network');

      setErrorMessage(translate('error.fetch_invoice', { error: safeError }));
      setIsLoading(false);
    };

    fetchInvoice();

    return () => {
      cancelled = true;
      clearTimeout(retryTimer);
      resolvePendingDelay?.();
    };
  }, [hasManualPayment, checkoutToken]);

  if (!hasManualPayment) return null;

  return (
    <s-box padding="base" border="base" borderRadius="base">
      <s-stack direction="block" gap="base">
        {isLoading && (
          <s-stack direction="block" gap="tight">
            <s-spinner size="large" />
            <s-text>{translate('generating_invoice')}</s-text>
          </s-stack>
        )}
        {!isLoading && errorMessage && (
          <s-text tone="critical" type="strong">{errorMessage}</s-text>
        )}
        {!isLoading && successfulCheckoutToken === checkoutToken && (
          <>
            <s-text>{translate('shop_name')}: {shop.name}</s-text>
            <s-text type="strong">{translate('reviewAndPay')}</s-text>
            <s-text>{translate('reviewOrderMessage')}.</s-text>
            <s-button href={`PLUGIN_URL/checkout?checkout_token=${encodeURIComponent(checkoutToken)}`} target="_blank" variant="primary">
              {translate('complete_payment')}
            </s-button>
          </>
        )}
      </s-stack>
    </s-box>
  );
}
