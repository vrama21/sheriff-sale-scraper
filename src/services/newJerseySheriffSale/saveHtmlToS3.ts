import { DateTime } from 'luxon';
import { getS3, saveS3 } from '../s3';

export type SaveHtmlToS3Args = {
  html: string;
  keyPrefix: string;
  keySuffix: string;
};

export const saveHtmlToS3 = async ({ html, keyPrefix, keySuffix }: SaveHtmlToS3Args) => {
  const { NJ_SHERIFF_SALE_BUCKET_NAME } = process.env;

  if (!NJ_SHERIFF_SALE_BUCKET_NAME) {
    throw new Error('NJ_SHERIFF_SALE_BUCKET_NAME is not defined');
  }

  const todaysDate = DateTime.utc().toISODate();
  const s3FileName = `${keyPrefix}/${todaysDate}/$${keySuffix}`;

  console.log(`Checking if ${s3FileName} already exists ...`);
  try {
    await getS3({
      bucketName: NJ_SHERIFF_SALE_BUCKET_NAME,
      key: s3FileName,
    });
    console.log(`${s3FileName} already exists. Skipping save to s3.`);

    return;
  } catch (error) {
    console.log(`Saving ${s3FileName} to s3 ...`);

    await saveS3({
      data: html,
      bucketName: NJ_SHERIFF_SALE_BUCKET_NAME,
      key: s3FileName,
    });
  }
};
