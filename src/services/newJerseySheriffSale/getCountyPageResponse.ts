import axios from 'axios';
import { decode } from 'he';
import { DateTime } from 'luxon';

import { getCountyId } from './getCountyId';
import { saveS3 } from '../s3';

export const getCountyPageResponse = async (county: string) => {
  const countyId = getCountyId(county);
  const sheriffSaleUrl = `https://salesweb.civilview.com/Sales/SalesSearch?countyId=${countyId}`;

  const response = await axios.get(sheriffSaleUrl);

  const todaysDate = DateTime.now().toISODate();
  const s3FileName = `counties/${todaysDate}/${county.toLowerCase()}-county.html`;

  console.log(`Saving ${county} county html page to s3...`);
  await saveS3({
    data: decode(response.data),
    bucketName: process.env.NJ_SCRAPER_CONFIG_BUCKET_NAME as string,
    key: s3FileName,
  });

  return response;
};
