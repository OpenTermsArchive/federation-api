import config from 'config';
import express from 'express';
import fetch from 'node-fetch';

const app = express();

class HTTPResponseError extends Error {
  constructor(response) {
    super(`HTTP Error Response: ${response.status} ${response.statusText}`);
    this.response = response;
  }
}

const checkStatus = response => {
  if (response.ok) {
    return response;
  }

  throw new HTTPResponseError(response);
};

const fetchCollections = async () => {
  const response = await fetch(config.get('collectionsUrl'));

  checkStatus(response);
  const collections = await response.json();

  return Object.keys(collections).reduce((accumulator, collectionName) => {
    if (collections[collectionName].endpoint) {
      accumulator.push({ name: collectionName, ...collections[collectionName] });
    }

    return accumulator;
  }, []);
};

const fetchServices = async endpoint => {
  const response = await fetch(`${endpoint}/services`);

  checkStatus(response);

  return response.json();
};

const sendErrorResponse = (res, error) => {
  res.status(error.response?.status || 500).json({ error: `${error.message} (${error.code})` });
};

app.use(express.json());

app.get('/collections', async (req, res) => {
  try {
    res.json(await fetchCollections());
  } catch (error) {
    sendErrorResponse(res, error);
  }
});

app.get('/services', async (req, res) => {
  const { name, termsTypes } = req.query;

  const collections = await fetchCollections().catch(error => {
    sendErrorResponse(res, error);
  });

  if (!collections) {
    return;
  }

  const results = [];
  const failures = [];

  await Promise.all(collections.map(async ({ name: collectionName, endpoint }) => {
    const services = await fetchServices(endpoint).catch(error => {
      failures.push({ collection: collectionName, message: error.toString() });
    });

    if (!services) {
      return;
    }

    for (const service of services) {
      if (!service.terms || (name && service.name !== name)) {
        continue;
      }

      const serviceTermsTypes = service.terms.map(terms => terms.type);
      const filteredServiceTermsTypes = termsTypes ? serviceTermsTypes.filter(serviceTermsType => termsTypes.includes(serviceTermsType)) : serviceTermsTypes;

      if (!filteredServiceTermsTypes.length) {
        continue;
      }

      results.push({
        collection: collectionName,
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
});

app.get('/service/:serviceId', async (req, res) => {
  const { serviceId } = req.params;

  const collections = await fetchCollections().catch(error => {
    sendErrorResponse(res, error);
  });

  if (!collections) {
    return;
  }

  const results = [];
  const failures = [];

  await Promise.all(collections.map(async ({ name: collectionName, endpoint }) => {
    const services = await fetchServices(endpoint).catch(error => {
      failures.push({ collection: collectionName, message: error.toString() });
    });

    if (!services) {
      return;
    }

    for (const service of services) {
      if (service.id != serviceId) {
        continue;
      }

      results.push({
        collection: collectionName,
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
    res.status(404).send('Service not found');

    return;
  }

  res.json({ results, failures });
});

const port = config.get('port');

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

export default app;
