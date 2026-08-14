import assert from 'node:assert/strict';
import test from 'node:test';

import {
  canSafelyRetryInvoiceCreation,
  fetchInvoiceWithSingleSafeRetry,
} from '../src/invoice-retry.mjs';

function response(status, body = '') {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: `HTTP ${status}`,
    text: async () => body,
  };
}

test('stops after the first successful request', async () => {
  const sleeps = [];
  let requests = 0;

  const result = await fetchInvoiceWithSingleSafeRetry({
    request: async () => {
      requests += 1;
      return response(200);
    },
    sleep: async (delayMs) => sleeps.push(delayMs),
  });

  assert.equal(result.type, 'success');
  assert.equal(result.attempts, 1);
  assert.equal(requests, 1);
  assert.deepEqual(sleeps, [2000]);
});

test('retries once after an explicit pre-creation consistency error', async () => {
  const sleeps = [];
  const responses = [response(400, 'Invalid checkout token'), response(200)];

  const result = await fetchInvoiceWithSingleSafeRetry({
    request: async () => responses.shift(),
    sleep: async (delayMs) => sleeps.push(delayMs),
  });

  assert.equal(result.type, 'success');
  assert.equal(result.attempts, 2);
  assert.deepEqual(sleeps, [2000, 5000]);
});

test('does not retry ambiguous or permanent HTTP failures', async () => {
  for (const failedResponse of [
    response(400, 'Invalid store configuration'),
    response(429),
    response(500),
  ]) {
    let requests = 0;

    const result = await fetchInvoiceWithSingleSafeRetry({
      request: async () => {
        requests += 1;
        return failedResponse;
      },
      sleep: async () => {},
    });

    assert.equal(result.type, 'http_failure');
    assert.equal(result.attempts, 1);
    assert.equal(requests, 1);
  }
});

test('does not retry an ambiguous network failure', async () => {
  let requests = 0;

  const result = await fetchInvoiceWithSingleSafeRetry({
    request: async () => {
      requests += 1;
      throw new Error('network unavailable');
    },
    sleep: async () => {},
  });

  assert.equal(result.type, 'network_failure');
  assert.equal(result.attempts, 1);
  assert.equal(requests, 1);
});

test('never makes more than one retry', async () => {
  let requests = 0;

  const result = await fetchInvoiceWithSingleSafeRetry({
    request: async () => {
      requests += 1;
      return response(400, 'The shopify order is not capturable');
    },
    sleep: async () => {},
  });

  assert.equal(result.type, 'http_failure');
  assert.equal(result.attempts, 2);
  assert.equal(requests, 2);
});

test('does not request an invoice after cancellation during a delay', async () => {
  let cancelled = false;
  let requests = 0;

  const result = await fetchInvoiceWithSingleSafeRetry({
    request: async () => {
      requests += 1;
      return response(200);
    },
    sleep: async () => {
      cancelled = true;
    },
    isCancelled: () => cancelled,
  });

  assert.equal(result.type, 'cancelled');
  assert.equal(requests, 0);
});

test('only classifies known pre-creation errors as safe to retry', () => {
  assert.equal(canSafelyRetryInvoiceCreation(400, 'Invalid checkout token'), true);
  assert.equal(
    canSafelyRetryInvoiceCreation(400, '  The Shopify order is not capturable\n'),
    true,
  );
  assert.equal(canSafelyRetryInvoiceCreation(400, 'Order is not capturable yet'), false);
  assert.equal(canSafelyRetryInvoiceCreation(400, 'Invalid store configuration'), false);
  assert.equal(canSafelyRetryInvoiceCreation(500, 'Invalid checkout token'), false);
});
