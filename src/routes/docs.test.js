import { expect } from 'chai';
import request from 'supertest';

import app, { basePath } from '../index.js';

describe('Docs API', () => {
  describe('GET /docs', () => {
    let response;

    context('When requested as JSON', () => {
      before(async () => {
        response = await request(app).get(`${basePath}/docs/`).set('Accept', 'application/json');
      });

      it('responds with 200 status code', () => {
        expect(response.status).to.equal(200);
      });

      it('responds with Content-Type application/json', () => {
        expect(response.type).to.equal('application/json');
      });

      describe('body response defines', () => {
        let subject;

        before(async () => {
          subject = response.body;
        });

        it('OpenAPI version', () => {
          expect(subject).to.have.property('openapi');
        });

        it('paths', () => {
          expect(subject).to.have.property('paths');
        });

        describe('with endpoints', () => {
          before(async () => {
            subject = response.body.paths;
          });

          it('/collections', () => {
            expect(subject).to.have.property('/collections');
          });

          it('/services', () => {
            expect(subject).to.have.property('/services');
          });

          it('/service/{serviceId}', () => {
            expect(subject).to.have.property('/service/{serviceId}');
          });
        });
      });
    });

    context('When requested as HTML', () => {
      before(async () => {
        response = await request(app).get(`${basePath}/docs/`);
      });

      it('responds with 200 status code', () => {
        expect(response.status).to.equal(200);
      });

      it('responds with Content-Type text/html', () => {
        expect(response.type).to.equal('text/html');
      });
    });
  });
});
