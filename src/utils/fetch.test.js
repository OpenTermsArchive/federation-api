import { expect } from 'chai';
import nock from 'nock';

import fetch, { HTTPResponseError, DEFAULT_TIMEOUT } from './fetch.js';

describe('Fetch', () => {
  describe('Response parsing', () => {
    it('parses response as JSON', async () => {
      const scope = nock('https://example.com').get('/').reply(200, { data: 'success' });

      const result = await fetch('https://example.com');

      // Assert the result or any other expectations
      expect(result).to.deep.equal({ data: 'success' });

      scope.done();
    });
  });

  describe('Errors handling', () => {
    context('for response containing client errors', () => {
      it('throws HTTPResponseError error', async () => {
        const scope = nock('https://example.com').get('/').reply(404);

        try {
          await fetch('https://example.com');
        } catch (error) {
          expect(error).to.be.an.instanceOf(HTTPResponseError);
        }

        scope.done();
      });
    });
    context('for response containing server errors', () => {
      it('throws HTTPResponseError error', async () => {
        const scope = nock('https://example.com').get('/').reply(502);

        try {
          await fetch('https://example.com');
        } catch (error) {
          expect(error).to.be.an.instanceOf(HTTPResponseError);
        }

        scope.done();
      });
    });
  });

  describe('Timeout', () => {
    it('aborts requests that exceed the timeout', async function () {
      this.timeout(DEFAULT_TIMEOUT + 1000);

      const scope = nock('https://example.com').get('/').delayConnection(DEFAULT_TIMEOUT + 100).reply(200, { data: 'success' }); // Simulate a delay of 3000ms

      try {
        await fetch('https://example.com', {});
      } catch (error) {
        expect(error.name).to.equal('AbortError');
      }

      scope.done();
    });
  });
});
