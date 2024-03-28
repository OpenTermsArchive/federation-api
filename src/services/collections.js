import fetch from '../utils/fetch.js';
import logger from '../utils/logger.js';

export const fetchCollections = async collectionsConfig => {
  let collections = [];

  for (const item of collectionsConfig) {
    if (typeof item === 'string') {
      /* eslint-disable no-await-in-loop */
      const fetchedCollections = await fetch(item); // Use `await` to ensure sequential fetching of collections and preserve the order in the resulting collections array

      /* eslint-enable no-await-in-loop */
      collections = collections.concat(fetchedCollections);
    }

    if (typeof item === 'object') {
      collections.push(item);
    }
  }

  collections = filterInvalidCollections(collections);

  return removeDuplicatesKeepLatest(collections);
};

export function removeDuplicatesKeepLatest(collections) {
  const uniqueCollections = {};

  collections.forEach(collection => {
    uniqueCollections[collection.id] = collection;
  });

  return Object.values(uniqueCollections);
}

export function filterInvalidCollections(collections) {
  return collections.filter(collection => {
    const isCollectionValid = collection.id && collection.name && collection.endpoint;

    if (!isCollectionValid) {
      logger.warn(`Ignore the following collection lacking mandatory fields 'id', 'name', or 'endpoint': \n${JSON.stringify(collection, null, 4)}`);
    }

    return isCollectionValid;
  });
}
