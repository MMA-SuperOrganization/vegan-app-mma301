import { apiClient, unwrapApiRequest } from '@/services/api';
import type { ImagePickerAsset } from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

const STORAGE_UPLOAD_TIMEOUT_MS = 30_000;

interface UploadRequest {
  assetId: string;
  uploadUrl: string;
  headers?: Record<string, string>;
  requiredHeaders?: Record<string, string>;
}
interface UploadOptions {
  signal?: AbortSignal;
  onProgress?: (percent: number) => void;
}
async function uploadAsset(
  asset: ImagePickerAsset,
  purpose:
    | 'ai_ingredient'
    | 'post'
    | 'avatar'
    | 'recipe'
    | 'recipe_step'
    | 'video_thumbnail'
    | 'ai_chat'
    | 'video',
  allowedMimeTypes: readonly string[],
  fallbackMimeType: string,
  fallbackFilename: string,
  options: UploadOptions = {}
) {
  const local = await readAsset(asset);
  const mimeType = normalizeMimeType(
    asset.mimeType || local.mimeType || fallbackMimeType
  );
  if (!allowedMimeTypes.includes(mimeType))
    throw new Error(purpose === 'video' ? 'UNSUPPORTED_VIDEO' : 'UNSUPPORTED_IMAGE');
  const upload = await unwrapApiRequest<UploadRequest>(() =>
    apiClient.post('/media/upload-requests', {
      filename: asset.fileName || fallbackFilename,
      mimeType,
      sizeBytes: local.sizeBytes,
      purpose,
    })
  );
  const uploadHeaders = upload.headers ?? upload.requiredHeaders ?? {};
  const headers = Object.fromEntries(
    Object.entries(uploadHeaders).filter(
      ([key]) => key.toLowerCase() !== 'content-length'
    )
  );
  if (!hasHeader(headers, 'content-type')) headers['Content-Type'] = mimeType;

  options.onProgress?.(10);
  if (Platform.OS === 'web') {
    await uploadBlob(upload.uploadUrl, local.blob!, headers, options.signal);
  } else {
    await uploadFile(
      upload.uploadUrl,
      asset.uri,
      headers,
      options.signal,
      options.onProgress
    );
  }
  options.onProgress?.(100);
  await unwrapApiRequest(() =>
    apiClient.post(`/media/${upload.assetId}/confirm`, {})
  );
  return upload.assetId;
}

async function readAsset(asset: ImagePickerAsset) {
  if (Platform.OS === 'web') {
    const response = await fetch(asset.uri);
    if (!response.ok) throw new Error('IMAGE_READ_FAILED');
    const blob = await response.blob();
    return { sizeBytes: blob.size, mimeType: blob.type, blob };
  }

  const info = await FileSystem.getInfoAsync(asset.uri);
  if (!info.exists || info.isDirectory || typeof info.size !== 'number')
    throw new Error('IMAGE_READ_FAILED');
  return { sizeBytes: info.size, mimeType: undefined, blob: undefined };
}

function normalizeMimeType(value: string) {
  const normalized = value.trim().toLowerCase();
  return normalized === 'image/jpg' ? 'image/jpeg' : normalized;
}

function hasHeader(headers: Record<string, string>, name: string) {
  return Object.keys(headers).some((key) => key.toLowerCase() === name);
}

async function uploadBlob(
  uploadUrl: string,
  blob: Blob,
  headers: Record<string, string>,
  signal?: AbortSignal
) {
  const controller = new AbortController();
  const abort = () => controller.abort();
  const timeout = setTimeout(abort, STORAGE_UPLOAD_TIMEOUT_MS);
  signal?.addEventListener('abort', abort, { once: true });

  try {
    const result = await fetch(uploadUrl, {
      method: 'PUT',
      headers,
      body: blob,
      signal: controller.signal,
    });
    if (!result.ok) throw new Error('UPLOAD_FAILED');
  } catch (error) {
    if (controller.signal.aborted && !signal?.aborted)
      throw new Error('UPLOAD_TIMEOUT');
    throw error;
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', abort);
  }
}

async function uploadFile(
  uploadUrl: string,
  fileUri: string,
  headers: Record<string, string>,
  signal?: AbortSignal,
  onProgress?: (percent: number) => void
) {
  const task = FileSystem.createUploadTask(
    uploadUrl,
    fileUri,
    {
      httpMethod: 'PUT',
      uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
      headers,
    },
    ({ totalBytesSent, totalBytesExpectedToSend }) => {
      if (totalBytesExpectedToSend > 0) {
        const ratio = totalBytesSent / totalBytesExpectedToSend;
        onProgress?.(Math.min(99, Math.max(10, Math.round(ratio * 100))));
      }
    }
  );
  let timedOut = false;
  const cancel = () => void task.cancelAsync();
  const timeout = setTimeout(() => {
    timedOut = true;
    cancel();
  }, STORAGE_UPLOAD_TIMEOUT_MS);
  signal?.addEventListener('abort', cancel, { once: true });

  try {
    const result = await task.uploadAsync();
    if (!result || result.status < 200 || result.status >= 300)
      throw new Error('UPLOAD_FAILED');
  } catch (error) {
    if (timedOut) throw new Error('UPLOAD_TIMEOUT');
    throw error;
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', cancel);
  }
}
export const mediaApi = {
  async uploadImage(
    asset: ImagePickerAsset,
    purpose:
      | 'ai_ingredient'
      | 'post'
      | 'avatar'
      | 'recipe'
      | 'recipe_step'
      | 'video_thumbnail'
      | 'ai_chat',
    options?: UploadOptions
  ) {
    return uploadAsset(
      asset,
      purpose,
      ['image/jpeg', 'image/png', 'image/webp'],
      'image/jpeg',
      'image.jpg',
      options
    );
  },
  async uploadVideo(asset: ImagePickerAsset, options?: UploadOptions) {
    return uploadAsset(
      asset,
      'video',
      ['video/mp4', 'video/webm'],
      'video/mp4',
      'video.mp4',
      options
    );
  },
  asset: (id: string) =>
    unwrapApiRequest<{ _id: string; downloadUrl?: string; expiresAt?: string }>(() =>
      apiClient.get(`/media/${id}`)
    ),
};
