import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { mediaApi } from '@/features/media/mediaApi';
import { AiErrorCode } from './aiConstants';

export function useAiImageAttachment() {
  const [asset, setAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);

  const upload = useMutation({
    mutationFn: async () => {
      if (!asset) throw new Error(AiErrorCode.IMAGE_REQUIRED);
      return mediaApi.uploadImage(asset, 'ai_chat');
    },
  });

  const choose = useMutation({
    mutationFn: async () => {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        throw new Error(AiErrorCode.PHOTO_PERMISSION_REQUIRED);
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
      });
      return result.canceled ? null : result.assets[0];
    },
    onSuccess: (selected) => {
      if (!selected) return;
      setAsset(selected);
      upload.reset();
    },
  });

  const clear = () => {
    setAsset(null);
    choose.reset();
    upload.reset();
  };

  const uploadIfNeeded = () =>
    asset ? upload.data || upload.mutateAsync() : Promise.resolve(undefined);

  return { asset, choose, upload, uploadIfNeeded, clear };
}
