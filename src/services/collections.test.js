import { expect } from 'chai';
import nock from 'nock';

import { fetchCollections, validateCollection } from './collections.js';

const COLLECTION_1 = {
  id: 'collection1',
  name: 'Collection 1',
  endpoint: 'http://domain1.example/endpoint',
};
const COLLECTION_2 = {
  id: 'collection2',
  name: 'Collection 2',
  endpoint: 'http://domain2.example/endpoint',
};
const COLLECTION_3 = {
  id: 'collection3',
  name: 'Collection 3',
  endpoint: 'http://domain3.example/endpoint',
};
const COLLECTION_1_OVERRIDEN = {
  id: COLLECTION_1.id,
  name: 'Override Collection 1',
  endpoint: 'http://domain1.example/endpoint_overriden',
};

describe('Services: Collections', () => {
  describe('fetchCollections', () => {
    before(() => {
      nock('http://domain1.example')
        .get('/collections.json')
        .reply(200, [ COLLECTION_1, COLLECTION_2 ])
        .persist();
    });

    after(() => nock.cleanAll());

    it('fetches collections from URLs and includes directly defined collections', async () => {
      const config = [
        'http://domain1.example/collections.json',
        COLLECTION_3,
      ];

      expect(await fetchCollections(config)).to.deep.equal([ COLLECTION_1, COLLECTION_2, COLLECTION_3 ]);
    });

    context('when there are duplicates', () => {
      it('removes duplicates', async () => {
        const config = [
          'http://domain1.example/collections.json',
          COLLECTION_1_OVERRIDEN,
        ];

        expect(await fetchCollections(config)).to.deep.equal([ COLLECTION_1_OVERRIDEN, COLLECTION_2 ]);
      });
    });

    context('with invalid collections', () => {
      it('removes collections with errors', async () => {
        const config = [
          COLLECTION_1,
          {
            name: 'Invalid collection',
            endpoint: 'http://domain1.example/endpoint',
          },
          {
            id: 'invalid-collection',
            endpoint: 'http://domain1.example/endpoint',
          },
          {
            id: 'invalid-collection',
            name: 'Invalid collection',
          },
          {
            id: 'invalid-endpoint',
            name: 'Invalid collection endpoint',
            endpoint: 'no url endpoint',
          },
          COLLECTION_3,
        ];

        expect(await fetchCollections(config)).to.deep.equal([ COLLECTION_1, COLLECTION_3 ]);
      });
    });
  });

  describe('validateCollection', () => {
    it('validates a collection with all mandatory fields', () => {
      const collection = {
        id: 'valid-collection',
        name: 'Valid Collection',
        endpoint: 'http://valid.example/endpoint',
      };
      const errors = validateCollection(collection);

      expect(errors).to.be.empty;
    });

    context('when mandatory fields are missing', () => {
      it('returns error when "id" is missing', () => {
        const collection = {
          name: 'Invalid collection',
          endpoint: 'http://invalid.example/endpoint',
        };
        const errors = validateCollection(collection);

        expect(errors).to.include('lack mandatory fields "id", "name", or "endpoint"');
      });

      it('returns error when "name" is missing', () => {
        const collection = {
          id: 'invalid-collection',
          endpoint: 'http://invalid.example/endpoint',
        };
        const errors = validateCollection(collection);

        expect(errors).to.include('lack mandatory fields "id", "name", or "endpoint"');
      });

      it('returns error when "endpoint" is missing', () => {
        const collection = {
          id: 'invalid-collection',
          name: 'Invalid collection',
        };
        const errors = validateCollection(collection);

        expect(errors).to.include('lack mandatory fields "id", "name", or "endpoint"');
      });
    });

    context('when endpoint is not a valid URL', () => {
      it('returns error for invalid URL endpoint', () => {
        const collection = {
          id: 'invalid-endpoint',
          name: 'Invalid collection endpoint',
          endpoint: 'no url endpoint',
        };
        const errors = validateCollection(collection);

        expect(errors).to.include('the endpoint is not a valid URL');
      });
    });
  });
});
