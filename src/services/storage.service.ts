import { S3Client, DeleteObjectCommand, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import config from "../config/index.js";

const s3 = new S3Client({
  region: config.storage.region,
  credentials: {
    accessKeyId: config.storage.key,
    secretAccessKey: config.storage.secret,
  },
});

const getBaseUrl = () =>
  config.storage.cdnUrl ||
  `https://${config.storage.bucket}.s3.${config.storage.region}.amazonaws.com`;

const assertConfigured = () => {
  if (!config.storage.key || !config.storage.secret || !config.storage.bucket) {
    throw new Error(
      "AWS S3 storage is not configured. Please set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_S3_BUCKET in your .env file."
    );
  }
};

/**
 * Upload a file buffer to AWS S3.
 * Returns the public URL of the uploaded file.
 */
export const uploadFile = async (
  buffer: Buffer,
  originalName: string,
  mimeType: string,
  folder: "avatars" | "documents"
): Promise<string> => {
  assertConfigured();

  const ext = path.extname(originalName).toLowerCase();
  const key = `${folder}/${uuidv4()}${ext}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: config.storage.bucket,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
      Metadata: {
        originalname: encodeURIComponent(originalName),
      },
    })
  );

  return `${getBaseUrl()}/${key}`;
};

/**
 * Generate a presigned download URL for an S3 file with the original filename.
 * expiresIn is in seconds (default 5 minutes).
 */
export const getSignedDownloadUrl = async (
  fileUrl: string,
  expiresIn = 300
): Promise<{ url: string; filename: string }> => {
  assertConfigured();

  const baseUrl = getBaseUrl();
  const key = fileUrl.replace(`${baseUrl}/`, "");

  // Fetch object metadata to retrieve original filename
  const headResult = await s3.send(
    new GetObjectCommand({ Bucket: config.storage.bucket, Key: key })
  );

  const rawName = headResult.Metadata?.originalname;
  const filename = rawName ? decodeURIComponent(rawName) : key.split("/").pop() ?? "file";

  const command = new GetObjectCommand({
    Bucket: config.storage.bucket,
    Key: key,
    ResponseContentDisposition: `attachment; filename="${filename}"`,
  });

  const url = await getSignedUrl(s3, command, { expiresIn });
  return { url, filename };
};

/**
 * Delete a file from AWS S3 by its public URL.
 * Logs a warning on failure but does not throw.
 */
export const deleteFile = async (fileUrl: string): Promise<void> => {
  if (!config.storage.key || !config.storage.bucket) return;

  try {
    const key = fileUrl.replace(`${getBaseUrl()}/`, "");
    await s3.send(
      new DeleteObjectCommand({
        Bucket: config.storage.bucket,
        Key: key,
      })
    );
  } catch (err) {
    console.warn("[storage] Failed to delete file from S3:", fileUrl, err);
  }
};
