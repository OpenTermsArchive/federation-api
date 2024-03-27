import fetch from '../utils/fetch.js';

export const fetchCollections = async collectionsConfig => {
  let collections = [];

  for (const item of collectionsConfig) {
    if (typeof item === 'string') {
      /* eslint-disable no-await-in-loop */
      const fetchedCollections = await fetch(item); // Use `await` to ensure sequential fetching of collections and preserve the order in the resulting collections array

      /* eslint-enable no-await-in-loop */

      collections = collections.concat(fetchedCollections.filter(collection => collection.id && collection.name && collection.endpoint));
    }

    if (typeof item === 'object' && item.id && item.name && item.endpoint) {
      collections.push(item);
    }
  }

  return removeDuplicatesKeepLatest(collections);
};

export function removeDuplicatesKeepLatest(collections) {
  const uniqueCollections = {};

  collections.forEach(collection => {
    uniqueCollections[collection.id] = collection;
  });

  return Object.values(uniqueCollections);
}
