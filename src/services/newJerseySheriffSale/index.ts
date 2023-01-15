import { getCountyId } from './getCountyId';
import { getCountyListingsHtml } from './getCountyListingsHtml';
import { getListingDetailsHtml } from './getListingDetailsHtml';
import { parseCountyProperyIds } from './parseCountyProperyIds';
import { cleanAddress } from './cleanAddress';
import { parseListingDetails } from './parseListingDetails';
import { parseStatusHistory } from './parseStatusHistory';
import { saveHtmlToS3 } from './saveHtmlToS3';

export const newJerseySheriffSaleService = {
  cleanAddress,
  getCountyId,
  getCountyListingsHtml,
  getListingDetailsHtml,
  parseCountyProperyIds,
  parseListingDetails,
  parseStatusHistory,
  saveHtmlToS3,
};
