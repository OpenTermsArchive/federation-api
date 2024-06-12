import { URL } from 'url';

import fetchAsJSON from '../utils/fetch.js';
import logger from '../utils/logger.js';

export async function fetchCollections(collectionsConfig) {
  const errors = [];
  const uniqueCollections = new Map();

  (await Promise.allSettled(collectionsConfig.map(async definition => {
    let collections = [];

    if (typeof definition === 'string') {
      collections = await fetchAsJSON(definition).catch(error => {
        throw new Error(`${error.message} when fetching ${definition}`);
      });
      if (!Array.isArray(collections)) {
        throw new Error(`Invalid format; an array of collections is expected when fetching ${definition}`);
      }
    }

    if (typeof definition === 'object') {
      collections = [definition];
    }

    return collections;
  }))).forEach(({ value: collections, reason: rejectionReason }) => {
    if (rejectionReason) {
      return errors.push(rejectionReason);
    }

    collections.forEach(collection => {
      const validationErrors = validateCollection(collection);

      if (validationErrors.length) {
        logger.warn(`Ignore collection "${JSON.stringify(collection)}" due to following errors: \n- ${validationErrors.join('\n- ')}`);

        return;
      }

      uniqueCollections.set(collection.id, collection);
    });
  });

  if (errors.length) {
    throw new Error(`\n${errors.join('\n')}`);
  }

  return Array.from(uniqueCollections.values());
}

export function validateCollection(collection) {
  const errors = [];

  const hasMandatoryFields = collection.id && collection.name && collection.endpoint;

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

  return errors;
}

function isURL(string) {
  try {
    return Boolean(new URL(string));
  } catch (error) {
    return false;
  }
}
