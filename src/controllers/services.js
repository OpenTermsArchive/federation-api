import { fetchCollections } from '../services/collections.js';
import { fetchServices } from '../services/services.js';

export const getServices = async (req, res) => {
  const { name: requestedName, termsTypes: requestedTermsTypes } = req.query;

  const collections = await fetchCollections();

  const results = [];
  const failures = [];

  await Promise.all(collections.map(async ({ id: collectionId, endpoint }) => {
    const services = await fetchServices(endpoint).catch(error => {
      failures.push({ collection: collectionId, message: error.toString() });
    });

    if (!services) {
      return;
    }

    for (const service of services) {
      if (!service.terms || (requestedName && !service.name.toLowerCase().includes(requestedName.toLowerCase()))) {
        continue;
      }

      const serviceTermsTypes = service.terms.map(terms => terms.type);
      const filteredServiceTermsTypes = requestedTermsTypes ? serviceTermsTypes.filter(serviceTermsType => requestedTermsTypes.includes(serviceTermsType)) : serviceTermsTypes;

      if (!filteredServiceTermsTypes.length) {
        continue;
      }

      results.push({
        collection: collectionId,
        service: {
          id: service.id,
          name: service.name,
          url: `${endpoint}/service/${encodeURIComponent(service.id)}`,
          termsTypes: filteredServiceTermsTypes,
        },
      });
    }
  }));

  res.json({ results, failures });
};

export const getService = async (req, res) => {
  const { serviceId } = req.params;

  const collections = await fetchCollections();

  const results = [];
  const failures = [];

  await Promise.all(collections.map(async ({ id: collectionId, endpoint }) => {
    const services = await fetchServices(endpoint).catch(error => {
      failures.push({ collection: collectionId, message: error.toString() });
    });

    if (!services) {
      return;
    }

    for (const service of services) {
      if (service.id != serviceId) {
        continue;
      }

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

  if (!results.length) {
    res.status(404).json({error: 'Service not found'});

    return;
  }

  res.json({ results, failures });
};
