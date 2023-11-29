// Adapted from the example provided in the node-fetch documentation on handling client and server errors. See https://github.com/node-fetch/node-fetch#handling-client-and-server-errors.
import nodeFetch from 'node-fetch';

class HTTPResponseError extends Error {
  constructor(response) {
    super(`HTTP Error Response: ${response.status} ${response.statusText}`);
    this.response = response;
  }
}

export const checkStatus = response => {
  if (response.ok) {
    return response;
  }

  throw new HTTPResponseError(response);
};

const fetch = async params => {
  const response = await nodeFetch(params);

  checkStatus(response);

  return response.json();
};

export default fetch;
