import { apiClient, unwrapApiRequest } from '@/services/api';
import type { ImagePickerAsset } from 'expo-image-picker';

interface UploadRequest {
  assetId: string;
  uploadUrl: string;
  headers: Record<string, string>;
}
export const mediaApi = {
  async uploadImage(asset: ImagePickerAsset, purpose: 'ai_ingredient' | 'post') {
    const response = await fetch(asset.uri);
    const blob = await response.blob();
    const mimeType = asset.mimeType || blob.type || 'image/jpeg';
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(mimeType))
      throw new Error('UNSUPPORTED_IMAGE');
    const upload = await unwrapApiRequest<UploadRequest>(() =>
      apiClient.post('/media/upload-requests', {
        filename: asset.fileName || 'ingredient.jpg',
        mimeType,
        sizeBytes: blob.size,
        purpose,
      })
    );
    // The signed request is a different origin and must never receive the API bearer token.
    const headers = Object.fromEntries(
      Object.entries(upload.headers).filter(
        ([key]) => key.toLowerCase() !== 'content-length'
      )
    );
    const sent = await fetch(upload.uploadUrl, {
      method: 'PUT',
      headers,
      body: blob,
    });
    if (!sent.ok) throw new Error('UPLOAD_FAILED');
    await unwrapApiRequest(() =>
      apiClient.post(`/media/${upload.assetId}/confirm`, {})
    );
    return upload.assetId;
  },
};
