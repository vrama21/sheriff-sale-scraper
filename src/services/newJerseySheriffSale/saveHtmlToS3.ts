import { DateTime } from 'luxon';
import { NJCounty } from '../../types';
import { getS3, saveS3 } from '../s3';

export const saveHtmlToS3 = async (html: string, county: NJCounty) => {
  if (!process.env.NJ_SCRAPER_BUCKET_NAME) {
    throw new Error('NJ_SCRAPER_BUCKET_NAME is not defined');
  }

  const todaysDate = DateTime.utc().toISODate();
  const s3FileName = `${todaysDate}/${county.toLowerCase()}-county.html`;

  console.log(`Checking if html file for county ${county} on ${todaysDate} already exists ...`);
  try {
    await getS3({
      bucketName: process.env.NJ_SCRAPER_BUCKET_NAME,
      key: s3FileName,
    });
    console.log(`Html file for county ${county} on ${todaysDate} already exists ...`);

    return;
  } catch (error) {
    console.log(`Saving ${s3FileName} to s3 ...`);

    await saveS3({
      data: html,
      bucketName: process.env.NJ_SCRAPER_BUCKET_NAME,
      key: s3FileName,
    });
  }
};
