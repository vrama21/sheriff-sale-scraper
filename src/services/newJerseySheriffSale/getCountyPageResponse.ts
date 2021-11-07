import axios from 'axios';
import { decode } from 'he';
import { DateTime } from 'luxon';

import { getCountyId } from './getCountyId';
import { saveS3 } from '../s3';

export const getCountyPageResponse = async (county: string) => {
  const countyId = getCountyId(county);
  const sheriffSaleUrl = `https://salesweb.civilview.com/Sales/SalesSearch?countyId=${countyId}`;

  const response = await axios.get(sheriffSaleUrl);

  const { NJ_SCRAPER_CONFIG_BUCKET_NAME } = process.env;
  const todaysDate = DateTime.now().toISODate();

  console.log(`Saving ${county} county html page to s3...`);
  await saveS3({
    data: decode(response.data),
    bucketName: NJ_SCRAPER_CONFIG_BUCKET_NAME,
    key: `counties/${todaysDate}/${county.toLowerCase()}-county.html`,
  });

  return response;
};
