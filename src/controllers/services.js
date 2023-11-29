import { fetchCollections } from '../services/collections.js';
import { fetchServices } from '../services/services.js';

export const getServices = async (req, res) => {
  const { name: requestedName, termsTypes: requestedTermsTypes } = req.query;

  const collections = await fetchCollections();

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

    if (requestedTermsTypes) {
      const requestedTermsTypesArray = [].concat(requestedTermsTypes); // when only one 'termTypes' query parameter is provided, Express parses it as a string; therefore, convert it to an array

      services = services.filter(service => {
        const matchingTerms = service.terms.filter(terms => requestedTermsTypesArray.includes(terms.type));

        return matchingTerms.length == requestedTermsTypesArray.length;
      });
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

  const collections = await fetchCollections();

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
