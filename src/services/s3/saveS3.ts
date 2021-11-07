import { S3 } from 'aws-sdk';

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
  const s3 = new S3();
  const params: S3.PutObjectRequest = {
    Body: data,
    Bucket: bucketName,
    Key: key,
  };

  if (sse) {
    params.ServerSideEncryption = 'AES256';
  }

  return s3.putObject(params).promise();
};
