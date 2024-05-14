import config from 'config';

import fetch from '../utils/fetch.js';

export const fetchCollections = async () => {
  const collections = await fetch(config.get('@opentermsarchive/federated-api.collectionsUrl'));

  return Object.keys(collections).reduce((result, collectionName) => {
    if (collections[collectionName].endpoint) {
      result.push({
        name: collectionName,
        id: collections[collectionName].id,
        endpoint: collections[collectionName].endpoint,
      });
    }

    return result;
  }, []);
};
