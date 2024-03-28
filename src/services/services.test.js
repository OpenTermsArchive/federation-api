import { expect } from 'chai';

import { isServiceIDValid } from './services.js';

describe('Services: Services', () => {
  describe('isServiceIDValid', () => {
    const VALID_SERVICE_IDS = {
      'with only alphanumeric': 'service',
      'with dot': 'servi.ce',
      'with exclamation mark': 'service!',
      'with question mark': 'service?',
      'with dash': 'service-',
      'with semi-colon': 'service;',
      'with comma': 'service,',
      'with underscore': 'service_',
      'with plus sign': 'service+',
      'with minus sign': 'service-',
      'with single quote': 'service\'',
      'with double quote': 'service"',
    };

    const INVALID_SERVICE_IDS = {
      'with ideograms': 'service抖',
      'with cyrillic': 'serviceД',
      'with accented letter': 'sérvice',
      'with ligature': 'særvice',
      'with colon': 'servi:ce',
      'with forward slash': 'servi/ce',
      'with backslash': 'servi\\ce',
      'with empty string': '',
      'with null value': null,
      'with undefined value': undefined,
    };

    context('for valid service IDs', () => {
      Object.entries(VALID_SERVICE_IDS).forEach(([ description, serviceID ]) => {
        context(`${description}`, () => {
          it('returns true', () => {
            const result = isServiceIDValid(serviceID);

            expect(result).to.be.true;
          });
        });
      });
    });

    context('for invalid service IDs', () => {
      Object.entries(INVALID_SERVICE_IDS).forEach(([ description, serviceID ]) => {
        context(`${description}`, () => {
          it('returns false', () => {
            const result = isServiceIDValid(serviceID);

            expect(result).to.be.false;
          });
        });
      });
    });
  });
});
