import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

interface GetConfig {
  bucketName: string;
  key: string;
}

/**
 * Gets object from bucket
 * @param bucketName - name of bucket
 * @param key - name of key
 */
export const getS3 = async ({ bucketName, key }: GetConfig) => {
  const s3 = new S3Client({ region: 'us-east-2' });

  const params = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  return s3.send(params);
};
