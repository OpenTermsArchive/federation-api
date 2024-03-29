import fetch from '../utils/fetch.js';
import logger from '../utils/logger.js';

export const fetchCollections = async collectionsConfig => {
  const unqiueCollections = new Map();

  const result = await Promise.allSettled(collectionsConfig.map(async item => {
    let collections = [];

    if (typeof item === 'string') {
      collections = await fetch(item);
    }

    if (typeof item === 'object') {
      collections = [item];
    }

    return filterInvalidCollections(collections);
  }));

  result.forEach(({ value }) => value.forEach(collection => unqiueCollections.set(collection.id, collection)));

  return Array.from(unqiueCollections.values());
};

export function filterInvalidCollections(collections) {
  return collections.filter(collection => {
    const isCollectionValid = collection.id && collection.name && collection.endpoint;

    if (!isCollectionValid) {
      logger.warn(`Ignore the following collection lacking mandatory fields 'id', 'name', or 'endpoint': \n${JSON.stringify(collection, null, 4)}`);
    }

    return isCollectionValid;
  });
}
