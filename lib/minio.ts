import * as Minio from 'minio';

const useSSL = process.env.MINIO_USE_SSL === 'true';
const [endpointHost, endpointPort] = (process.env.MINIO_ENDPOINT || 'localhost').split(':');
const defaultPort = useSSL ? 443 : 80;

const minioClient = new Minio.Client({
  endPoint: endpointHost,
  port: endpointPort ? parseInt(endpointPort) : defaultPort,
  useSSL,
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
});

const BUCKET_NAME = process.env.MINIO_BUCKET || 'hrm-logos';

export async function ensureBucketExists() {
  const exists = await minioClient.bucketExists(BUCKET_NAME);
  if (!exists) {
    await minioClient.makeBucket(BUCKET_NAME);
    // Set bucket policy to allow public read access for logos
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`],
        },
      ],
    };
    await minioClient.setBucketPolicy(BUCKET_NAME, JSON.stringify(policy));
  }
}

export async function uploadFile(
  file: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  await ensureBucketExists();
  
  await minioClient.putObject(BUCKET_NAME, filename, file, file.length, {
    'Content-Type': contentType,
  });
  
  // Return the URL to access the file
  const protocol = process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http';
  return `${protocol}://${process.env.MINIO_ENDPOINT}/${BUCKET_NAME}/${filename}`;
}

export async function deleteFile(filename: string): Promise<void> {
  await minioClient.removeObject(BUCKET_NAME, filename);
}

export { minioClient, BUCKET_NAME };