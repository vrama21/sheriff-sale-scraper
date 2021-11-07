import axios from 'axios';
import * as he from 'he'

export const getPropertyHtmlResponse = async (propertyId: string, aspSessionId: string) => {
  const listingDetailUrl = `https://salesweb.civilview.com/Sales/SaleDetails?PropertyId=${propertyId}`;

  const response = await axios.get(listingDetailUrl, {
    headers: { cookie: aspSessionId }
  });

  return he.decode(response.data);
};
