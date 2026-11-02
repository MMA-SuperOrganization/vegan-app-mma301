import { useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';

import { mediaApi } from '@/features/media/mediaApi';

export function usePostImageUpload() {
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const uploaded = useRef<{ uri: string; mediaId: string } | null>(null);
  const pendingUpload = useRef<Promise<string> | null>(null);
  const upload = useMutation({
    mutationFn: (asset: ImagePicker.ImagePickerAsset) =>
      mediaApi.uploadImage(asset, 'post'),
  });

  const selectImage = (asset: ImagePicker.ImagePickerAsset) => {
    uploaded.current = null;
    pendingUpload.current = null;
    upload.reset();
    setImage(asset);
  };

  const clearImage = () => {
    uploaded.current = null;
    pendingUpload.current = null;
    upload.reset();
    setImage(null);
  };

  const ensureUploaded = async () => {
    if (!image) return undefined;
    if (uploaded.current?.uri === image.uri) return uploaded.current.mediaId;
    if (pendingUpload.current) return pendingUpload.current;

    const request = upload.mutateAsync(image).then((mediaId) => {
      uploaded.current = { uri: image.uri, mediaId };
      return mediaId;
    });
    pendingUpload.current = request;
    try {
      return await request;
    } finally {
      pendingUpload.current = null;
    }
  };

  return { image, upload, selectImage, clearImage, ensureUploaded };
}
