import { URL } from 'url';

import fetch from '../utils/fetch.js';
import logger from '../utils/logger.js';

export const fetchCollections = async collectionsConfig => {
  const uniqueCollections = new Map();

  (await Promise.allSettled(collectionsConfig.map(async item => {
    let collections = [];

    if (typeof item === 'string') {
      collections = await fetch(item);
    }

    if (typeof item === 'object') {
      collections = [item];
    }

    return filterInvalidCollections(collections);
  }))).forEach(({ value }) => {
    value.forEach(collection => {
      uniqueCollections.set(collection.id, collection);
    });
  });

  return Array.from(uniqueCollections.values());
};

export function filterInvalidCollections(collections) {
  return collections.filter(collection => {
    const hasMandatoryFields = collection.id && collection.name && collection.endpoint;

    if (!hasMandatoryFields) {
      logger.warn(`Ignore the following collection lacking mandatory fields 'id', 'name', or 'endpoint': \n${JSON.stringify(collection, null, 4)}`);
    }

    const isEndpointValidUrl = isURL(collection.endpoint);

    if (!isEndpointValidUrl) {
      logger.warn(`Ignore the following collection as 'endpoint' is not a valid URL: \n${JSON.stringify(collection, null, 4)}`);
    }

    return hasMandatoryFields && isEndpointValidUrl;
  });
}

function isURL(string) {
  try {
    new URL(string); // eslint-disable-line no-new

    return true;
  } catch (error) {
    return false;
  }
}
