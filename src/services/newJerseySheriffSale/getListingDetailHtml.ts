import axios from 'axios';
import * as he from 'he';

export const getListingDetailHtml = async (propertyId: string, aspSessionId: string) => {
  const listingDetailUrl = `https://salesweb.civilview.com/Sales/SaleDetails?PropertyId=${propertyId}`;

  console.log(`Getting html for propertyId ${propertyId} from ${listingDetailUrl} ...`);
  const response = await axios.get<string>(listingDetailUrl, {
    headers: {
      cookie: `ASP.NET_SessionId=${aspSessionId}`,
    },
    withCredentials: true,
  });
  console.log(`Got html for propertyId ${propertyId} from ${listingDetailUrl} ...`);

  return he.decode(response.data);
};
