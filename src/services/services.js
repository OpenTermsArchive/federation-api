import fetch from '../utils/fetch.js';

export const fetchServices = async endpoint => fetch(`${endpoint}/services`);
