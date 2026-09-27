import { PutObjectCommand } from '@aws-sdk/client-s3'
import { createS3Client, getBucketConfig } from './aws-config'

const s3 = createS3Client()

/** Public URL for a publicly stored object (each key segment URL-encoded). */
export function getPublicFileUrl(cloud_storage_path: string): string {
  const { bucketName } = getBucketConfig()
  const region = process.env.AWS_REGION ?? 'us-west-2'
  const encoded = cloud_storage_path.split('/').map(encodeURIComponent).join('/')
  return `https://${bucketName}.s3.${region}.amazonaws.com/${encoded}`
}

/** Server-side upload of generated media to the public video-studio folder. Returns cloud_storage_path. */
export async function uploadPublicBuffer(relativeName: string, body: Buffer, contentType: string): Promise<string> {
  const { bucketName, folderPrefix } = getBucketConfig()
  const cloud_storage_path = `${folderPrefix}public/video-studio/${relativeName}`
  await s3.send(new PutObjectCommand({ Bucket: bucketName, Key: cloud_storage_path, Body: body, ContentType: contentType }))
  return cloud_storage_path
}
