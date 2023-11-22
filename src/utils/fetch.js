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

  return response;
};

export default fetch;
