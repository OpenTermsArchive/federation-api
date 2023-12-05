import { expect } from 'chai';

import { isServiceIDValid } from './services.js';

describe('isServiceIDValid', () => {
  const validServiceIDs = {
    'with only alphanumeric': 'service',
    'with dot': 'servi.ce',
    'with exclamation mark': 'service!',
    'with question mark': 'service?',
    'with dash': 'service-',
    'with semi-colon': 'service;',
    'with comma': 'service,',
  };

  const invalidServiceIDs = {
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
    Object.entries(validServiceIDs).forEach(([ description, serviceID ]) => {
      context(`${description}`, () => {
        it('returns true', () => {
          const result = isServiceIDValid(serviceID);

          expect(result).to.be.true;
        });
      });
    });
  });

  context('for invalid service IDs', () => {
    Object.entries(invalidServiceIDs).forEach(([ description, serviceID ]) => {
      context(`${description}`, () => {
        it('returns false', () => {
          const result = isServiceIDValid(serviceID);

          expect(result).to.be.false;
        });
      });
    });
  });
});
