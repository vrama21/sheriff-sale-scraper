import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

interface SaveConfig {
  data: string;
  bucketName: string;
  key: string;
  /**
   * @default false
   */
  sse?: boolean;
}

/**
 * Saves data into S3
 */
export const saveS3 = ({ data, bucketName, key, sse = false }: SaveConfig) => {
  const s3 = new S3Client({ region: 'us-east-2' });
  const params = new PutObjectCommand({
    Body: data,
    Bucket: bucketName,
    Key: key,
  });

  if (sse) {
    params.input.ServerSideEncryption = 'AES256';
  }

  return s3.send(params);
};
