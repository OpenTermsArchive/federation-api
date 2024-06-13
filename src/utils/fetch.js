// Adapted from the examples provided in the node-fetch documentation:
// - Handling client and server errors: See https://github.com/node-fetch/node-fetch#handling-client-and-server-errors.
// - Request cancellation with AbortSignal: https://github.com/node-fetch/node-fetch#request-cancellation-with-abortsignal.
import nodeFetch from 'node-fetch';

export const DEFAULT_TIMEOUT = 2000;

export class HTTPResponseError extends Error {
  constructor(response) {
    super(`HTTP Error Response: ${response.status} ${response.statusText}`.trim());
    this.response = response;
  }
}

export const checkStatus = response => {
  if (response.ok) {
    return response;
  }

  throw new HTTPResponseError(response);
};

const fetchAsJSON = async (url, options, timeout = DEFAULT_TIMEOUT) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeout);

  try {
    const response = await nodeFetch(url, { ...options, signal: controller.signal });

    checkStatus(response);

    return response.json();
  } finally {
    clearTimeout(timeoutId);
  }
};

export default fetchAsJSON;
