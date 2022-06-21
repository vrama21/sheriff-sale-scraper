import { decode } from 'he';
import { DateTime } from 'luxon';
import { getS3, saveS3 } from '../s3';

export const saveHtmlToS3 = async (htmlResponse: string, county: string) => {
  const decodedHtmlResponse = decode(htmlResponse);

  const todaysDate = DateTime.local().toISODate();
  const s3FileName = `${todaysDate}/${county.toLowerCase()}-county.html`;

  console.log(`Checking if html file for county ${county} on ${todaysDate} already exists ...`);
  try {
    await getS3({
      bucketName: process.env.NJ_SCRAPER_CONFIG_BUCKET_NAME as string,
      key: s3FileName,
    });
    console.log(`Html file for county ${county} on ${todaysDate} already exists ...`);

    return;
  } catch (error) {
    console.log(`Saving ${s3FileName} to s3 ...`);

    await saveS3({
      data: decodedHtmlResponse,
      bucketName: process.env.NJ_SCRAPER_CONFIG_BUCKET_NAME as string,
      key: s3FileName,
    });
  }
};
