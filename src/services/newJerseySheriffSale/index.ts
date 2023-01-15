import { getCountyId } from './getCountyId';
import { getCountyListingsHtml } from './getCountyListingsHtml';
import { getPropertyHtmlResponse } from './getPropertyHtmlResponse';
import { getPropertyIds } from './getCountyListingsPropertyIds';
import { parseAddress } from './parseAddress';
import { parsePropertyDetails } from './parsePropertyDetails';
import { parseStatusHistory } from './parseStatusHistory';
import { saveHtmlToS3 } from './saveHtmlToS3';

export const newJerseySheriffSaleService = {
  getCountyId,
  getCountyListingsHtml,
  getPropertyHtmlResponse,
  getPropertyIds,
  parseAddress,
  parsePropertyDetails,
  parseStatusHistory,
  saveHtmlToS3,
};
