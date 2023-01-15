import { getCountyId } from './getCountyId';
import { getCountyListingsHtml } from './getCountyListingsHtml';
import { getListingDetailHtml } from './getListingDetailHtml';
import { parseCountyProperyIds } from './parseCountyProperyIds';
import { cleanAddress } from './cleanAddress';
import { parseListingDetails } from './parseListingDetails';
import { parseStatusHistory } from './parseStatusHistory';
import { saveHtmlToS3 } from './saveHtmlToS3';

export const newJerseySheriffSaleService = {
  cleanAddress,
  getCountyId,
  getCountyListingsHtml,
  getListingDetailHtml,
  parseCountyProperyIds,
  parseListingDetails,
  parseStatusHistory,
  saveHtmlToS3,
};
