import { expect } from 'chai';
import config from 'config';
import nock from 'nock';
import request from 'supertest';

import app, { basePath } from '../index.js';

export const COLLECTIONS_RESULT = {
  'Collection 1': {
    id: 'collection-1',
    endpoint: 'http://collection-1.org/api/v1',
  },
  'Collection 2': {
    id: 'collection-2',
    endpoint: 'http://collection-2.org/api/v1',
  },
};

const COLLECTION_1_SERVICES_RESULT = [
  {
    id: 'service-1',
    name: 'Service 1',
    terms: [
      { type: 'Privacy Policy' },
    ],
  },
  {
    id: 'service-2',
    name: 'Service 2',
    terms: [
      { type: 'Terms of Service' },
      { type: 'Privacy Policy' },
    ],
  },
];

const COLLECTION_2_SERVICES_RESULT = [
  {
    id: 'service-1',
    name: 'Service 1',
    terms: [
      { type: 'Privacy Policy' },
      { type: 'Terms of Service' },
    ],
  },
  {
    id: 'service-3',
    name: 'Service 3',
    terms: [
      { type: 'Community Guidelines' },
    ],
  },
];

describe('Services routes', () => {
  before(() => {
    nock(config.get('collectionsUrl')).persist().get('').reply(200, COLLECTIONS_RESULT);
    nock('http://collection-1.org').persist().get('/api/v1/services').reply(200, COLLECTION_1_SERVICES_RESULT);
    nock('http://collection-2.org').persist().get('/api/v1/services').reply(200, COLLECTION_2_SERVICES_RESULT);
  });

  after(() => {
    nock.cleanAll();
  });

  describe('GET /services', () => {
    let response;

    context('with no query params', () => {
      before(async () => {
        response = await request(app).get(`${basePath}/services`);
      });

      it('responds with 200 status code', () => {
        expect(response.status).to.equal(200);
      });

      it('responds with Content-Type application/json', () => {
        expect(response.type).to.equal('application/json');
      });

      it('returns an non empty results array', () => {
        expect(response.body).to.have.property('results').that.is.an('array');
        expect(response.body.results).to.not.be.empty;
      });

      describe('each #result object', () => {
        it('has a collection name', () => {
          response.body.results.forEach(result => {
            expect(result).to.have.property('collection').that.is.a('string');
          });
        });

        it('has a service object', () => {
          response.body.results.forEach(result => {
            expect(result).to.have.property('service');
          });
        });

        describe('#service object', () => {
          it('has an id', () => {
            response.body.results.forEach(result => {
              expect(result.service).to.have.property('id').that.is.a('string');
            });
          });

          it('has an name', () => {
            response.body.results.forEach(result => {
              expect(result.service).to.have.property('name').that.is.a('string');
            });
          });

          it('has an url', () => {
            response.body.results.forEach(result => {
              expect(result.service).to.have.property('url').that.is.a('string');
            });
          });

          it('has an array of termsTypes', () => {
            response.body.results.forEach(result => {
              expect(result.service).to.have.property('termsTypes').that.is.an('array');
            });
          });
        });
      });

      it('returns an emtpy failures array', () => {
        expect(response.body).to.have.property('failures').that.is.an('array');
        expect(response.body.failures).to.be.empty;
      });
    });

    describe('query params', () => {
      context('with name query param', () => {
        before(async () => {
          response = await request(app).get(`${basePath}/services?name=Service%202`);
        });

        it('responds with 200 status code', () => {
          expect(response.status).to.equal(200);
        });

        it('returns a results array with matching services based on the query parameter', () => {
          expect(response.body).to.have.property('results').that.is.an('array');
          expect(response.body.results).to.have.lengthOf(1);
          expect(response.body.results[0].collection).to.equal('collection-1');
          expect(response.body.results[0].service.id).to.equal('service-2');
        });

        context('with non-matching name query param', () => {
          before(async () => {
            response = await request(app).get(`${basePath}/services?name=unknown%20name`);
          });

          it('responds with 200 status code', () => {
            expect(response.status).to.equal(200);
          });

          it('returns an empty results array', () => {
            expect(response.body).to.have.property('results').that.is.an('array');
            expect(response.body.results).to.be.empty;
          });
        });
      });

      context('with termsTypes query param', () => {
        before(async () => {
          response = await request(app).get(`${basePath}/services?termsTypes=Community%20Guidelines`);
        });

        it('responds with 200 status code', () => {
          expect(response.status).to.equal(200);
        });

        it('returns a results array with matching services based on the query parameter', () => {
          expect(response.body).to.have.property('results').that.is.an('array');
          expect(response.body.results).to.have.lengthOf(1);
          expect(response.body.results[0].collection).to.equal('collection-2');
          expect(response.body.results[0].service.id).to.equal('service-3');
        });

        context('with non-matching termsTypes query param', () => {
          before(async () => {
            response = await request(app).get(`${basePath}/services?termsTypes=unknown%20type`);
          });

          it('responds with 200 status code', () => {
            expect(response.status).to.equal(200);
          });

          it('returns an empty results array', () => {
            expect(response.body).to.have.property('results').that.is.an('array');
            expect(response.body.results).to.be.empty;
          });
        });
      });

      context('with both name and termsTypes query params', () => {
        before(async () => {
          response = await request(app).get(`${basePath}/services?name=Service%202&termsTypes=Privacy%20Policy`);
        });

        it('responds with 200 status code', () => {
          expect(response.status).to.equal(200);
        });

        it('returns a results array with matching services based on the query parameters', () => {
          expect(response.body).to.have.property('results').that.is.an('array');
          expect(response.body.results).to.have.lengthOf(1);
          expect(response.body.results[0].collection).to.equal('collection-1');
          expect(response.body.results[0].service.id).to.equal('service-2');
        });
      });
    });

    context('when an error occurs in one of the underlying collections', () => {
      before(async () => {
        nock.cleanAll();
        nock(config.get('collectionsUrl')).persist().get('').reply(200, COLLECTIONS_RESULT);
        nock('http://collection-1.org').persist().get('/api/v1/services').reply(200, COLLECTION_1_SERVICES_RESULT);
        nock('http://collection-2.org').get('/api/v1/services').replyWithError({
          message: 'something went wrong',
          code: 'ERROR',
        });
        response = await request(app).get(`${basePath}/services`);
      });

      it('returns a non empty results array', () => {
        expect(response.body.results).to.not.be.empty;
      });

      describe('#result object', () => {
        it('has a collection name', () => {
          response.body.results.forEach(result => {
            expect(result).to.have.property('collection').that.is.a('string');
          });
        });

        it('has a service object', () => {
          response.body.results.forEach(result => {
            expect(result).to.have.property('service');
          });
        });
      });

      it('returns a non empty failures array', () => {
        expect(response.body.failures).to.not.be.empty;
      });

      describe('#failure object', () => {
        it('has a collection name', () => {
          response.body.failures.forEach(failure => {
            expect(failure).to.have.property('collection').that.is.an('string');
          });
        });

        it('has a detailed error message', () => {
          response.body.failures.forEach(failure => {
            expect(failure).to.have.property('message').that.is.an('string');
          });
        });
      });
    });
  });

  describe('GET /service/:serviceId', () => {
    let response;

    before(async () => {
      nock('http://collection-1.org').persist().get('/api/v1/services').reply(200, COLLECTION_1_SERVICES_RESULT);
      nock('http://collection-2.org').persist().get('/api/v1/services').reply(200, COLLECTION_2_SERVICES_RESULT);
      response = await request(app).get(`${basePath}/service/service-1`);
    });

    it('responds with 200 status code', () => {
      expect(response.status).to.equal(200);
    });

    it('responds with Content-Type application/json', () => {
      expect(response.type).to.equal('application/json');
    });

    it('returns an non empty results array', () => {
      expect(response.body).to.have.property('results').that.is.an('array');
      expect(response.body.results).to.not.be.empty;
    });

    describe('each #result object', () => {
      it('has a collection name', () => {
        response.body.results.forEach(result => {
          expect(result).to.have.property('collection').that.is.a('string');
        });
      });

      it('has a service object', () => {
        response.body.results.forEach(result => {
          expect(result).to.have.property('service');
        });
      });

      describe('each service object', () => {
        it('has the proper id', () => {
          response.body.results.forEach(result => {
            expect(result.service).to.have.property('id').that.is.equal('service-1');
          });
        });

        it('has the proper name', () => {
          response.body.results.forEach(result => {
            expect(result.service).to.have.property('name').that.is.equal('Service 1');
          });
        });

        it('has the proper url', () => {
          const [resultCollection1] = response.body.results.filter(result => result.collection == 'collection-1');

          expect(resultCollection1.service).to.have.property('url').that.is.equal('http://collection-1.org/api/v1/service/service-1');

          const [resultCollection2] = response.body.results.filter(result => result.collection == 'collection-2');

          expect(resultCollection2.service).to.have.property('url').that.is.equal('http://collection-2.org/api/v1/service/service-1');
        });

        it('has the proper array of termsTypes', () => {
          const [resultCollection1] = response.body.results.filter(result => result.collection == 'collection-1');

          expect(resultCollection1.service).to.have.property('termsTypes');
          expect(resultCollection1.service.termsTypes).to.have.deep.members(['Privacy Policy']);

          const [resultCollection2] = response.body.results.filter(result => result.collection == 'collection-2');

          expect(resultCollection2.service).to.have.property('termsTypes');
          expect(resultCollection2.service.termsTypes).to.have.deep.members([ 'Terms of Service', 'Privacy Policy' ]);
        });
      });
    });

    it('returns an emtpy failures array', () => {
      expect(response.body).to.have.property('failures').that.is.an('array');
      expect(response.body.failures).to.be.empty;
    });

    context('when no matching service is found', () => {
      before(async () => {
        response = await request(app).get(`${basePath}/service/service-inexistent`);
      });

      it('responds with 404 status code', () => {
        expect(response.status).to.equal(404);
      });
    });
  });
});
