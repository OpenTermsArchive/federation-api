import { expect } from 'chai';
import nock from 'nock';

import { fetchCollections } from './collections.js';

describe('Services: Collections', () => {
  const COLLECTION_1 = { id: 'collection1', name: 'Collection 1', endpoint: 'http://domain1.example/endpoint' };
  const COLLECTION_2 = { id: 'collection2', name: 'Collection 2', endpoint: 'http://domain1.example/endpoint' };
  const COLLECTION_3 = { id: 'collection3', name: 'Collection 3', endpoint: 'http://domain1.example/endpoint' };
  const COLLECTION_1_OVERRIDEN = { id: COLLECTION_1.id, name: 'Override Collection 1', endpoint: 'http://domain2.example/endpoint' };

  describe('fetchCollections', () => {
    it('fetches collections from URLs and includes directly given collections', async () => {
      nock('http://domain1.example')
        .get('/collections.json')
        .reply(200, [ COLLECTION_1, COLLECTION_2 ]);

      const config = [
        'http://domain1.example/collections.json',
        COLLECTION_3,
      ];

      expect(await fetchCollections(config)).to.deep.equal([ COLLECTION_1, COLLECTION_2, COLLECTION_3 ]);
    });
  });

  context('when there are duplicates', () => {
    it('removes duplicates', async () => {
      nock('http://domain1.example')
        .get('/collections.json')
        .reply(200, [ COLLECTION_1, COLLECTION_2 ]);

      const config = [
        'http://domain1.example/collections.json',
        COLLECTION_1_OVERRIDEN,
      ];

      expect(await fetchCollections(config)).to.deep.equal([ COLLECTION_1_OVERRIDEN, COLLECTION_2 ]);
    });
  });

  context('with collections lacking mandatory fields', () => {
    context('when "id" is missing', () => {
      it('removes invalid collection', async () => {
        const config = [
          COLLECTION_1,
          {
            name: 'Invalid collection',
            endpoint: 'http://domain1.example/endpoint',
          },
          COLLECTION_3,
        ];

        expect(await fetchCollections(config)).to.deep.equal([ COLLECTION_1, COLLECTION_3 ]);
      });
    });

    context('when "name" is missing', () => {
      it('removes invalid collection', async () => {
        const config = [
          COLLECTION_1,
          {
            id: 'invalid-collection',
            endpoint: 'http://domain1.example/endpoint',
          },
          COLLECTION_3,
        ];

        expect(await fetchCollections(config)).to.deep.equal([ COLLECTION_1, COLLECTION_3 ]);
      });
    });

    context('when "endpoint" is missing', () => {
      it('removes invalid collection', async () => {
        const config = [
          COLLECTION_1,
          {
            id: 'invalid-collection',
            name: 'Invalid collection',
          },
          COLLECTION_3,
        ];

        expect(await fetchCollections(config)).to.deep.equal([ COLLECTION_1, COLLECTION_3 ]);
      });
    });
  });
});
