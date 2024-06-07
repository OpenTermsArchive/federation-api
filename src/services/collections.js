import { URL } from 'url';

import fetch from '../utils/fetch.js';
import logger from '../utils/logger.js';

export async function fetchCollections(collectionsConfig) {
  const errors = [];
  const uniqueCollections = new Map();

  (await Promise.allSettled(collectionsConfig.map(async item => {
    let collections = [];

    if (typeof item === 'string') {
      collections = await fetch(item).catch(error => {
        throw new Error(`${error.message} when fetching ${item}`);
      });
      if (!Array.isArray(collections)) {
        throw new Error(`Invalid format; an array of collections is expected when fetching ${item}`);
      }
    }

    if (typeof item === 'object') {
      collections = [item];
    }

    return filterInvalidCollections(collections);
  }))).forEach(({ value, reason }) => {
    if (reason) {
      return errors.push(reason);
    }
    value.forEach(collection => {
      uniqueCollections.set(collection.id, collection);
    });
  });

  if (errors.length) {
    throw new Error(`\n${errors.join('\n')}`);
  }

  return Array.from(uniqueCollections.values());
}

function filterInvalidCollections(collections) {
  return collections.filter(collection => {
    const hasMandatoryFields = collection.id && collection.name && collection.endpoint;

    const errors = [];

    if (!hasMandatoryFields) {
      errors.push('lack mandatory fields "id", "name", or "endpoint"');
    }

    let isEndpointValidUrl = true;

    if (collection.endpoint) {
      isEndpointValidUrl = isURL(collection.endpoint);

      if (!isEndpointValidUrl) {
        errors.push('the endpoint is not a valid URL');
      }
    }

    if (errors.length) {
      logger.warn(`Ignore collection "${JSON.stringify(collection)}" due to following errors: \n- ${errors.join('\n- ')}`);
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
