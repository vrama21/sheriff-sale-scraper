import { getCountyId } from './getCountyId';
import { getCountyListingsHtml } from './getCountyListingsHtml';
import { getListingDetailHtml } from './getListingDetailHtml';
import { parseCountyProperyIds } from './parseCountyProperyIds';
import { parseAddress } from './parseAddress';
import { parsePropertyDetails } from './parsePropertyDetails';
import { parseStatusHistory } from './parseStatusHistory';
import { saveHtmlToS3 } from './saveHtmlToS3';

export const newJerseySheriffSaleService = {
  getCountyId,
  getCountyListingsHtml,
  getListingDetailHtml,
  parseAddress,
  parseCountyProperyIds,
  parsePropertyDetails,
  parseStatusHistory,
  saveHtmlToS3,
};
