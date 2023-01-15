import axios from 'axios';
import * as he from 'he';
import { saveHtmlToS3 } from './saveHtmlToS3';

export type GetListingDetailsHtmlArgs = {
  aspSessionId: string;
  propertyId: string;
};

export const getListingDetailsHtml = async ({
  propertyId,
  aspSessionId,
}: GetListingDetailsHtmlArgs): Promise<string> => {
  const listingDetailUrl = `https://salesweb.civilview.com/Sales/SaleDetails?PropertyId=${propertyId}`;

  console.log(
    `Getting html for propertyId ${propertyId} from ${listingDetailUrl} with aspSessionId ${aspSessionId} ...`,
  );
  const response = await axios.get<string>(listingDetailUrl, {
    headers: {
      Cookie: `ASP.NET_SessionId=${aspSessionId}`,
    },
    withCredentials: true,
  });

  if (!response.data || response.status !== 200) {
    throw new Error(`Axios failed to get data from ${listingDetailUrl}`);
  }

  const html = he.decode(response.data);
  console.log(`Got html for propertyId ${propertyId} from ${listingDetailUrl} ...`);

  await saveHtmlToS3({ html, keyPrefix: 'listing-html-files', keySuffix: `property-id-${propertyId}.html` });

  return he.decode(response.data);
};
