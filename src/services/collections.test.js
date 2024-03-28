import { expect } from 'chai';
import nock from 'nock';

import { fetchCollections, removeDuplicatesKeepLatest } from './collections.js';

describe('Services: Collections', () => {
  const COLLECTION_1 = { id: 'collection1', name: 'Collection 1', endpoint: 'http://domain1.example/endpoint' };
  const COLLECTION_2 = { id: 'collection2', name: 'Collection 2', endpoint: 'http://domain1.example/endpoint' };
  const COLLECTION_3 = { id: 'collection3', name: 'Collection 3', endpoint: 'http://domain1.example/endpoint' };
  const COLLECTION_1_OVERRIDEN = { id: COLLECTION_1.id, name: 'Override Collection 1', endpoint: 'http://domain2.example/endpoint' };
  const COLLECTION_2_OVERRIDEN = { id: COLLECTION_2.id, name: 'Override Collection 2', endpoint: 'http://domain2.example/endpoint' };

  describe('removeDuplicatesKeepLatest', () => {
    it('removes duplicates based on their id and keeps the latest defined', () => {
      const collections = [ COLLECTION_1, COLLECTION_2, COLLECTION_2_OVERRIDEN, COLLECTION_3 ];
      const uniqueCollections = removeDuplicatesKeepLatest(collections);

      expect(uniqueCollections).to.deep.equal([ COLLECTION_1, COLLECTION_2_OVERRIDEN, COLLECTION_3 ]);
    });
  });

  describe('fetchCollections', () => {
    it('fetches collections from URLs, includes directly given collections, and removes duplicates', async () => {
      nock('http://domain1.example')
        .get('/collections.json')
        .reply(200, [ COLLECTION_1, COLLECTION_2 ]);

      nock('http://domain2.example')
        .get('/collections.json')
        .reply(200, [ COLLECTION_3, COLLECTION_2_OVERRIDEN ]);

      const config = [
        'http://domain1.example/collections.json',
        COLLECTION_1_OVERRIDEN,
        'http://domain2.example/collections.json',
      ];

      expect(await fetchCollections(config)).to.deep.equal([ COLLECTION_1_OVERRIDEN, COLLECTION_2_OVERRIDEN, COLLECTION_3 ]);
    });
  });
});
