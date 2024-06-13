import { expect } from 'chai';
import nock from 'nock';
import sinon from 'sinon';

import logger from './utils/logger.js';

import { initializeCollections } from './index.js';

describe('initializeCollections', () => {
  const COLLECTIONS_URL = 'https://federation.example/collections.json';

  context('when everything is fine', () => {
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

    let collections;

    before(async () => {
      nock(COLLECTIONS_URL).get('').reply(200, [ COLLECTION_2, COLLECTION_3 ]);
      collections = await initializeCollections([ COLLECTION_1, COLLECTIONS_URL ]);
    });

    it('fetches all collections and return them', async () => {
      expect(collections).to.deep.equal([ COLLECTION_1, COLLECTION_2, COLLECTION_3 ]);
    });
  });

  context('when the resulting collections is empty', () => {
    before(async () => {
      sinon.stub(process, 'exit');
      sinon.stub(logger, 'error');
      nock(COLLECTIONS_URL).get('').reply(200, []);
      await initializeCollections([COLLECTIONS_URL]);
    });

    after(() => {
      process.exit.restore();
      logger.error.restore();
    });

    it('logs a detailed error', async () => {
      expect(logger.error.called).to.be.true;
      expect(logger.error.lastCall.firstArg).to.include('No valid collection declared, the process will exit as this API cannot fulfil any request');
    });

    it('exits the process', () => {
      expect(process.exit.called).to.be.true;
    });
  });

  context('when fetching the collections list fails', () => {
    [ 403, 404, 500, 502 ].forEach(errorCode => {
      context(`with a HTTP ${errorCode} error`, () => {
        before(async () => {
          sinon.stub(process, 'exit');
          sinon.stub(logger, 'error');
          nock(COLLECTIONS_URL).get('').reply(errorCode);
          await initializeCollections([COLLECTIONS_URL]);
        });

        after(() => {
          process.exit.restore();
          logger.error.restore();
        });

        it('logs a detailed error', async () => {
          expect(logger.error.called).to.be.true;
          expect(logger.error.lastCall.firstArg).to.include(errorCode);
          expect(logger.error.lastCall.firstArg).to.include(COLLECTIONS_URL);
        });

        it('exits the process', () => {
          expect(process.exit.called).to.be.true;
        });
      });
    });
  });
});
