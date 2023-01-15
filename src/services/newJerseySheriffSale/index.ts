import { cleanAddress } from './cleanAddress';
import { getCountyId } from './getCountyId';
import { getCountyListingsHtml } from './getCountyListingsHtml';
import { getListingDetailsHtml } from './getListingDetailsHtml';
import { parseCountyProperyIds } from './parseCountyProperyIds';
import { parseListingDetails } from './parseListingDetails';
import { parseStatusHistory } from './parseStatusHistory';
import { saveHtmlToS3 } from './saveHtmlToS3';
import { sendMessageToListingParserQueue } from './sendMessageToListingParserQueue';

export const newJerseySheriffSaleService = {
  cleanAddress,
  getCountyId,
  getCountyListingsHtml,
  getListingDetailsHtml,
  parseCountyProperyIds,
  parseListingDetails,
  parseStatusHistory,
  saveHtmlToS3,
  sendMessageToListingParserQueue,
};
