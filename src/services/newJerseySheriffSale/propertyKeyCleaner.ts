import { camelCase } from 'lodash';

const acceptedKeys = [
  'address',
  'attorney',
  'attorneyPhone',
  'courtCase',
  'deed',
  'deedAddress',
  'defendant',
  'description',
  'judgment',
  'parcel',
  'plaintiff',
  'priors',
  'saleDate',
  'sheriff',
  'upset',
] as const;

type PropertyKey = typeof acceptedKeys[number];

export const propertyKeyCleaner = (key: string): PropertyKey => {
  let cleanKey = key.replace(/#?:?/g, '').trim();

  if (cleanKey.toLowerCase().match(/judgment/)) {
    cleanKey = 'judgment';
  }

  if (cleanKey.toLowerCase().match(/upset/)) {
    cleanKey = 'upset';
  }

  if (cleanKey === 'Sales Date') {
    return 'saleDate';
  }

  cleanKey = camelCase(cleanKey);

  if (!acceptedKeys.includes(cleanKey as PropertyKey)) {
    console.error(`Missing key ${cleanKey}`);
  }

  return cleanKey as PropertyKey;
};
