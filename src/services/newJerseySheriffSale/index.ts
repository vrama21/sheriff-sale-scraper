import { cleanAddress } from './cleanAddress';
import { getCountyListingsHtml } from './getCountyListingsHtml';
import { getListingDetailsHtml } from './getListingDetailsHtml';
import { parseCountyProperyIds } from './parseCountyProperyIds';
import { parseListingDetails } from './parseListingDetails';
import { parseStatusHistory } from './parseStatusHistory';
import { saveHtmlToS3 } from './saveHtmlToS3';

export const newJerseySheriffSaleService = {
  cleanAddress,
  getCountyListingsHtml,
  getListingDetailsHtml,
  parseCountyProperyIds,
  parseListingDetails,
  parseStatusHistory,
  saveHtmlToS3,
};

export * from './newJerseySheriffSaleHttpClient';
