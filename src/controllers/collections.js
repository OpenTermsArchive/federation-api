export const getCollections = async (req, res) => {
  res.json(req.app.locals.collections);
};
