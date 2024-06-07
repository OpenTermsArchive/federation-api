import nock from 'nock';

export const COLLECTIONS_RESULT = [
  {
    name: 'Collection 1',
    id: 'collection-1',
    endpoint: 'http://collection-1.example/api/v1',
  },
  {
    name: 'Collection 2',
    id: 'collection-2',
    endpoint: 'https://2.collection.example/api/v1',
  },
];

nock('https://opentermsarchive.org/collections.json').persist().get('').reply(200, COLLECTIONS_RESULT);

console.log('test/helpers.js: Globally mock HTTP request for "https://opentermsarchive.org/collections.json"\n');
