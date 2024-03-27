import config from 'config';

import { fetchCollections } from '../services/collections.js';

export const getCollections = async (req, res) => {
  res.json(await fetchCollections(config.get('collections')));
};
