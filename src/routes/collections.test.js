import { expect } from 'chai';
import request from 'supertest';

import app, { BASE_PATH } from '../index.js';

describe('Routes: Collections', () => {
  describe('GET /collections', () => {
    let response;

    before(async () => {
      response = await request(app).get(`${BASE_PATH}/collections`);
    });

    it('responds with 200 status code', () => {
      expect(response.status).to.equal(200);
    });

    it('responds with Content-Type application/json', () => {
      expect(response.type).to.equal('application/json');
    });

    it('returns a non empty array of collections', () => {
      expect(response.body).to.be.an('array');
      expect(response.body).to.not.be.empty;
    });

    describe('each #collection object', () => {
      it('has an id', () => {
        response.body.forEach(collection => {
          expect(collection).to.have.property('id').that.is.a('string');
        });
      });

      it('has a name', () => {
        response.body.forEach(collection => {
          expect(collection).to.have.property('name').that.is.a('string');
        });
      });

      it('has an endpoint', () => {
        response.body.forEach(collection => {
          expect(collection).to.have.property('endpoint').that.is.a('string');
        });
      });
    });
  });
});
