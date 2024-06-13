import { expect } from 'chai';
import nock from 'nock';
import request from 'supertest';

import app, { BASE_PATH } from '../index.js';
import { isValidURL } from '../utils/url.js';

const COLLECTION_1_SERVICES_RESULT = [
  {
    id: 'service-1',
    name: 'Service 1',
    terms: [
      { type: 'Privacy Policy' },
    ],
  },
  {
    id: 'Service with Chinese characters',
    name: '抖音短视频',
    terms: [
      { type: 'Terms of Service' },
      { type: 'Privacy Policy' },
    ],
  },
  {
    id: 'cAsInG',
    name: 'cAsInG',
    terms: [
      { type: 'Copyright Claims Policy' },
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
    id: '%',
    name: '%',
    terms: [
      { type: 'Community Guidelines' },
    ],
  },
  {
    id: 'casing',
    name: 'casing',
    terms: [
      { type: 'Copyright Claims Policy' },
    ],
  },
];

// Use the global HTTP request mock for the URL 'https://opentermsarchive.org/collections.json' defined in 'test/helpers.js'
describe('Routes: Services', () => {
  const serviceWithUrlEncodedChineseCharactersName = '%E6%8A%96%E9%9F%B3%E7%9F%AD%E8%A7%86%E9%A2%91';

  before(async () => {
    nock('http://collection-1.example').persist().get('/collection-api/v1/services').reply(200, COLLECTION_1_SERVICES_RESULT);
    nock('https://2.collection.example').persist().get('/collection-api/v1/services').reply(200, COLLECTION_2_SERVICES_RESULT);
  });

  after(() => {
    nock.cleanAll();
  });

  describe('GET /services', () => {
    let response;

    context('with no query params', () => {
      before(async () => {
        response = await request(app).get(`${BASE_PATH}/services`);
      });

      it('responds with 200 status code', () => {
        expect(response.status).to.equal(200);
      });

      it('responds with Content-Type application/json', () => {
        expect(response.type).to.equal('application/json');
      });

      it('returns a non empty results array', () => {
        expect(response.body).to.have.property('results').that.is.an('array');
        expect(response.body.results).to.not.be.empty;
      });

      describe('each result object', () => {
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

        describe('service object', () => {
          it('has an id', () => {
            response.body.results.forEach(result => {
              expect(result.service).to.have.property('id').that.is.a('string');
            });
          });

          it('has a name', () => {
            response.body.results.forEach(result => {
              expect(result.service).to.have.property('name').that.is.a('string');
            });
          });

          it('has an url', () => {
            response.body.results.forEach(result => {
              expect(result.service).to.have.property('url').that.is.a('string');
              expect(isValidURL(result.service.url)).to.be.true;
            });
          });

          it('has an array of termsTypes', () => {
            response.body.results.forEach(result => {
              expect(result.service).to.have.property('termsTypes').that.is.an('array');
            });
          });
        });
      });

      it('returns an empty failures array', () => {
        expect(response.body).to.have.property('failures').that.is.an('array');
        expect(response.body.failures).to.be.empty;
      });
    });

    describe('query params', () => {
      context('with name query param', () => {
        context('when it matches a service name', () => {
          before(async () => {
            response = await request(app).get(`${BASE_PATH}/services?name=${serviceWithUrlEncodedChineseCharactersName}`);
          });

          it('responds with 200 status code', () => {
            expect(response.status).to.equal(200);
          });

          it('returns a results array with matching services based on the query parameter', () => {
            expect(response.body).to.have.property('results').that.is.an('array');
            expect(response.body.results).to.have.lengthOf(1);
            expect(response.body.results[0].collection).to.equal('collection-1');
            expect(response.body.results[0].service.id).to.equal('Service with Chinese characters');
          });
        });

        context('when it does not fully match a service name', () => {
          before(async () => {
            response = await request(app).get(`${BASE_PATH}/services?name=service`);
          });

          it('responds with 200 status code', () => {
            expect(response.status).to.equal(200);
          });

          it('returns a results array with matching services based on the query parameter', () => {
            expect(response.body).to.have.property('results').that.is.an('array');
            expect(response.body.results).to.have.lengthOf(2);
          });
        });

        context('when there is a case-sensitive collision in service names', () => {
          before(async () => {
            response = await request(app).get(`${BASE_PATH}/services?name=Casing`);
          });

          it('responds with 200 status code', () => {
            expect(response.status).to.equal(200);
          });

          it('returns a results array with matching services based on the query parameter', () => {
            expect(response.body).to.have.property('results').that.is.an('array');
            expect(response.body.results).to.have.lengthOf(2);
          });
        });

        context('when it matches no services', () => {
          before(async () => {
            response = await request(app).get(`${BASE_PATH}/services?name=unknown%20name`);
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

      context('with termsType query param', () => {
        context('with one matching terms types', () => {
          before(async () => {
            response = await request(app).get(`${BASE_PATH}/services?termsType=Community%20Guidelines`);
          });

          it('responds with 200 status code', () => {
            expect(response.status).to.equal(200);
          });

          it('returns a results array with matching services based on the query parameter', () => {
            expect(response.body).to.have.property('results').that.is.an('array');
            expect(response.body.results).to.have.lengthOf(1);
            expect(response.body.results[0].collection).to.equal('collection-2');
            expect(response.body.results[0].service.id).to.equal('%');
          });
        });

        context('with non-matching termsType query param', () => {
          before(async () => {
            response = await request(app).get(`${BASE_PATH}/services?termsType=unknown%20type`);
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

      context('with both name and termsType query params', () => {
        before(async () => {
          response = await request(app).get(`${BASE_PATH}/services?name=${serviceWithUrlEncodedChineseCharactersName}&termsType=Privacy%20Policy`);
        });

        it('responds with 200 status code', () => {
          expect(response.status).to.equal(200);
        });

        it('returns a results array with matching services based on the query parameters', () => {
          expect(response.body).to.have.property('results').that.is.an('array');
          expect(response.body.results).to.have.lengthOf(1);
          expect(response.body.results[0].collection).to.equal('collection-1');
          expect(response.body.results[0].service.id).to.equal('Service with Chinese characters');
        });
      });
    });

    context('when an error occurs in one of the underlying collections', () => {
      context('with an error in the JSON response', () => {
        const ERROR_MESSAGE = 'something went wrong';

        before(async () => {
          nock.cleanAll();
          nock('http://collection-1.example').persist().get('/collection-api/v1/services').reply(200, COLLECTION_1_SERVICES_RESULT);
          nock('https://2.collection.example').get('/collection-api/v1/services').replyWithError({
            message: ERROR_MESSAGE,
            code: 'ERROR',
          });
          response = await request(app).get(`${BASE_PATH}/services`);
        });

        it('returns a non empty results array', () => {
          expect(response.body.results).to.not.be.empty;
        });

        it('returns a non empty failures array', () => {
          expect(response.body.failures).to.not.be.empty;
        });

        describe('failure entries', () => {
          it('have a collection name', () => {
            expect(response.body.failures.map(failure => failure.collection)).to.have.members(['collection-2']);
          });

          it('have a detailed error message', () => {
            response.body.failures.forEach(failure => {
              expect(failure).to.have.property('message').that.has.string(ERROR_MESSAGE);
            });
          });
        });
      });

      [ 403, 404, 500, 502 ].forEach(errorCode => {
        context(`with a HTTP ${errorCode} error`, () => {
          before(async () => {
            nock.cleanAll();
            nock('http://collection-1.example').persist().get('/collection-api/v1/services').reply(200, COLLECTION_1_SERVICES_RESULT);
            nock('https://2.collection.example').get('/collection-api/v1/services').reply(errorCode);
            response = await request(app).get(`${BASE_PATH}/services`);
          });

          it('returns a non empty results array', () => {
            expect(response.body.results).to.not.be.empty;
          });

          it('returns a non empty failures array', () => {
            expect(response.body.failures).to.not.be.empty;
          });

          describe('failure entries', () => {
            it('have a collection name', () => {
              expect(response.body.failures.map(failure => failure.collection)).to.have.members(['collection-2']);
            });

            it('have a detailed error message', () => {
              response.body.failures.forEach(failure => {
                expect(failure).to.have.property('message').that.has.string(errorCode);
              });
            });
          });
        });
      });
    });
  });

  describe('GET /service/:serviceId', () => {
    let response;

    before(async () => {
      nock('http://collection-1.example').persist().get('/collection-api/v1/services').reply(200, COLLECTION_1_SERVICES_RESULT);
      nock('https://2.collection.example').persist().get('/collection-api/v1/services').reply(200, COLLECTION_2_SERVICES_RESULT);
      response = await request(app).get(`${BASE_PATH}/service/service-1`);
    });

    it('responds with 200 status code', () => {
      expect(response.status).to.equal(200);
    });

    it('responds with Content-Type application/json', () => {
      expect(response.type).to.equal('application/json');
    });

    it('returns a non empty results array', () => {
      expect(response.body).to.have.property('results').that.is.an('array');
      expect(response.body.results).to.not.be.empty;
    });

    describe('each result object', () => {
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
            expect(result.service).to.have.property('id').that.equals('service-1');
          });
        });

        it('has the proper name', () => {
          response.body.results.forEach(result => {
            expect(result.service).to.have.property('name').that.equals('Service 1');
          });
        });

        it('has the proper url', () => {
          const [resultCollection1] = response.body.results.filter(result => result.collection == 'collection-1');

          expect(resultCollection1.service).to.have.property('url').that.equals('http://collection-1.example/collection-api/v1/service/service-1');

          const [resultCollection2] = response.body.results.filter(result => result.collection == 'collection-2');

          expect(resultCollection2.service).to.have.property('url').that.equals('https://2.collection.example/collection-api/v1/service/service-1');
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

    it('returns an empty failures array', () => {
      expect(response.body).to.have.property('failures').that.is.an('array');
      expect(response.body.failures).to.be.empty;
    });

    context('when no matching service is found', () => {
      before(async () => {
        response = await request(app).get(`${BASE_PATH}/service/service-inexistent`);
      });

      it('responds with 404 status code', () => {
        expect(response.status).to.equal(404);
      });

      it('responds with an empty results array', () => {
        expect(response.body.results).to.be.empty;
      });
    });

    context('when an invalid service ID is given', () => {
      before(async () => {
        response = await request(app).get(`${BASE_PATH}/service/service:`);
      });

      it('responds with 400 status code', () => {
        expect(response.status).to.equal(400);
      });
    });
  });
});
