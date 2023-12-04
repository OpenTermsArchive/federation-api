import fetch from '../utils/fetch.js';

const SERVICE_ID_VALIDATION_REGEX = /^[a-zA-Z0-9\s\-'.!;,\?]+$/; // eslint-disable-line no-useless-escape

export async function fetchServices(endpoint) {
  return fetch(`${endpoint}/services`);
}

export function isServiceIDValid(serviceId) {
  return Boolean(serviceId) && SERVICE_ID_VALIDATION_REGEX.test(serviceId);
}
