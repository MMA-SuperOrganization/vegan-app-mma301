import { apiClient, unwrapApiRequest } from '@/services/api';
import type { ImagePickerAsset } from 'expo-image-picker';
import axios from 'axios';

interface UploadRequest {
  assetId: string;
  uploadUrl: string;
  headers: Record<string, string>;
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
  const response = await fetch(asset.uri);
  const blob = await response.blob();
  const mimeType = asset.mimeType || blob.type || fallbackMimeType;
  if (!allowedMimeTypes.includes(mimeType))
    throw new Error(purpose === 'video' ? 'UNSUPPORTED_VIDEO' : 'UNSUPPORTED_IMAGE');
  const upload = await unwrapApiRequest<UploadRequest>(() =>
    apiClient.post('/media/upload-requests', {
      filename: asset.fileName || fallbackFilename,
      mimeType,
      sizeBytes: blob.size,
      purpose,
    })
  );
  const headers = Object.fromEntries(
    Object.entries(upload.headers).filter(
      ([key]) => key.toLowerCase() !== 'content-length'
    )
  );
  await axios.put(upload.uploadUrl, blob, {
    headers,
    signal: options.signal,
    onUploadProgress: ({ loaded, total }) => {
      if (total)
        options.onProgress?.(Math.min(100, Math.round((loaded / total) * 100)));
    },
  });
  options.onProgress?.(100);
  await unwrapApiRequest(() =>
    apiClient.post(`/media/${upload.assetId}/confirm`, {})
  );
  return upload.assetId;
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
