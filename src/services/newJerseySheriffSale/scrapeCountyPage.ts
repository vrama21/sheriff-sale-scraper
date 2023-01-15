import axios, { AxiosResponse } from 'axios';
import { getCountyId } from './getCountyId';

export const scrapeCountyPage = async (county: string): Promise<AxiosResponse<string>> => {
  const countyId = getCountyId(county);
  const sheriffSaleUrl = `https://salesweb.civilview.com/Sales/SalesSearch?countyId=${countyId}`;

  const response = await axios.get(sheriffSaleUrl);

  return response;
};
