export const INITIAL_INVOICE_DELAY_MS = 2000;
export const SAFE_RETRY_DELAY_MS = 5000;

const SAFE_RETRY_ERRORS = new Set([
  'invalid checkout token',
  'the shopify order is not capturable',
]);

export function canSafelyRetryInvoiceCreation(status, responseBody = '') {
  return status === 400 && SAFE_RETRY_ERRORS.has(responseBody.trim().toLowerCase());
}

async function requestInvoice(request) {
  try {
    const response = await request();
    if (response.ok) return { type: 'success', response };

    return {
      type: 'http_failure',
      response,
      responseBody: await response.text(),
    };
  } catch (error) {
    return { type: 'network_failure', error };
  }
}

export async function fetchInvoiceWithSingleSafeRetry({
  request,
  sleep,
  isCancelled = () => false,
}) {
  await sleep(INITIAL_INVOICE_DELAY_MS);
  if (isCancelled()) return { type: 'cancelled', attempts: 0 };

  const firstResult = await requestInvoice(request);
  if (isCancelled()) return { type: 'cancelled', attempts: 1 };

  if (
    firstResult.type !== 'http_failure' ||
    !canSafelyRetryInvoiceCreation(
      firstResult.response.status,
      firstResult.responseBody,
    )
  ) {
    return { ...firstResult, attempts: 1 };
  }

  await sleep(SAFE_RETRY_DELAY_MS);
  if (isCancelled()) return { type: 'cancelled', attempts: 1 };

  const secondResult = await requestInvoice(request);
  if (isCancelled()) return { type: 'cancelled', attempts: 2 };

  return { ...secondResult, attempts: 2 };
}
