import { fetchServices, isServiceIDValid } from '../services/services.js';

export const getServices = async (req, res) => {
  const { name: requestedName, termsType: requestedTermsType } = req.query;

  const { collections } = req.app.locals;

  const results = [];
  const failures = [];

  await Promise.all(collections.map(async ({ id: collectionId, endpoint }) => {
    let services = await fetchServices(endpoint).catch(error => {
      failures.push({ collection: collectionId, message: error.toString() });
    });

    if (!services) {
      return;
    }

    services = services.filter(service => service.terms); // `terms` could be undefined in cases where the targeted collection has its deployed API version under v0.33.0

    if (requestedName) {
      services = services.filter(service => service.name.toLowerCase().includes(requestedName.toLowerCase()));
    }

    if (requestedTermsType) {
      services = services.filter(service => service.terms.find(terms => requestedTermsType.includes(terms.type)));
    }

    for (const service of services) {
      results.push({
        collection: collectionId,
        service: {
          id: service.id,
          name: service.name,
          url: `${endpoint}/service/${encodeURIComponent(service.id)}`,
          termsTypes: service.terms.map(terms => terms.type),
        },
      });
    }
  }));

  res.json({ results, failures });
};

export const getService = async (req, res) => {
  const { serviceId: requestedServiceId } = req.params;

  if (!isServiceIDValid(requestedServiceId)) {
    return res.status(400).json();
  }

  const { collections } = req.app.locals;

  const results = [];
  const failures = [];

  await Promise.all(collections.map(async collection => {
    const services = await fetchServices(collection.endpoint).catch(error => {
      failures.push({ collection: collection.id, message: error.toString() });
    });

    if (!services) {
      return;
    }

    const service = services.find(service => service.id == requestedServiceId);

    if (!service) {
      return;
    }

    results.push({
      collection: collection.id,
      service: {
        id: service.id,
        name: service.name,
        url: `${collection.endpoint}/service/${encodeURIComponent(service.id)}`,
        termsTypes: service.terms?.map(terms => terms.type),
      },
    });
  }));

  let status = 200;

  if (!results.length) {
    status = 404;
  }

  res.status(status).json({ results, failures });
};
