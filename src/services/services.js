import fetch from '../utils/fetch.js';

export const fetchServices = async endpoint => {
  const response = await fetch(`${endpoint}/services`);

  return response.json();
};
