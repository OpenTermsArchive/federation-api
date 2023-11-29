import config from 'config';

import fetch from '../utils/fetch.js';

export const fetchCollections = async () => {
  const response = await fetch(config.get('collectionsUrl'));

  const collections = await response.json();

  return Object.keys(collections).reduce((accumulator, collectionName) => {
    if (collections[collectionName].endpoint) {
      accumulator.push({
        name: collectionName,
        id: collections[collectionName].id,
        endpoint: collections[collectionName].endpoint,
      });
    }

    return accumulator;
  }, []);
};
