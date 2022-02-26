import { decode } from 'he';
import { DateTime } from 'luxon';
import { getS3, saveS3 } from '../s3';

export const saveHtmlToS3 = async (htmlResponse: string, county: string) => {
  const decodedHtmlResponse = decode(htmlResponse);

  const todaysDate = DateTime.now().toISODate();
  const s3FileName = `counties/${todaysDate}/${county.toLowerCase()}-county.html`;

  console.log(`Checking if html file for county ${county} on ${todaysDate} already exists...`);
  const htmlFile = await getS3(process.env.NJ_SCRAPER_CONFIG_BUCKET_NAME as string, s3FileName);

  if (htmlFile) {
    console.log(`Html file for county ${county} on ${todaysDate} already exists...`);

    return;
  }

  console.log(`Saving ${county} county html page to s3...`);

  await saveS3({
    data: decodedHtmlResponse,
    bucketName: process.env.NJ_SCRAPER_CONFIG_BUCKET_NAME as string,
    key: s3FileName,
  });
};
