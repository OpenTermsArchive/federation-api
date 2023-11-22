import { fetchCollections } from '../services/collections.js';

export const getCollections = async (req, res) => {
  try {
    res.json(await fetchCollections());
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: `${error.message} (${error.code})` });
  }
};
