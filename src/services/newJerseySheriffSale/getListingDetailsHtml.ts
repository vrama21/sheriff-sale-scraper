import * as he from 'he';
import { saveHtmlToS3 } from './saveHtmlToS3';
import { NewJerseySheriffSaleHttpClient } from './newJerseySheriffSaleHttpClient';

export type GetListingDetailsHtmlArgs = {
  propertyId: string;
};

export const getListingDetailsHtml = async ({ propertyId }: GetListingDetailsHtmlArgs): Promise<string> => {
  const njSheriffSaleClient = NewJerseySheriffSaleHttpClient.getClient();

  console.log(`Getting html for propertyId ${propertyId}...`);
  const response = await njSheriffSaleClient.get<string>('/Sales/SaleDetails', {
    params: {
      PropertyId: propertyId,
    },
  });

  const html = he.decode(response.data);

  await saveHtmlToS3({ html, keyPrefix: 'listing-html-files', keySuffix: `property-id-${propertyId}.html` });

  return he.decode(response.data);
};
