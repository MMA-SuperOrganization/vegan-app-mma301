import { useState } from 'react';
import { Image, View } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { AppButton, AppText, CustomHeader, ScreenWrapper } from '@/components';
import { FeatureState } from '@/components/feedback/FeatureState';
import { mediaApi } from '@/features/media/mediaApi';
import { isLocalIsoDate } from '@/features/tracking/trackingState';
import { useTranslation } from '@/i18n';
import { colors, spacing } from '@/theme';
import { useIngredientRecognition } from '../hooks';
import { IngredientReviewEditor } from '@/features/pantry/components/IngredientReviewEditor';
import type { PantryProposal } from '../types';
import { reviewPantryProposal } from '../proposalState';

export function IngredientRecognitionScreen() {
  const vi = useTranslation().locale === 'vi';
  const router = useRouter();
  const [asset, setAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [proposal, setProposal] = useState<PantryProposal | null>(null);
  const actions = useIngredientRecognition();
  const upload = useMutation({
    mutationFn: () => mediaApi.uploadImage(asset!, 'ai_ingredient'),
  });
  const choose = useMutation({
    mutationFn: async (camera: boolean) => {
      if (camera) {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) throw new Error('CAMERA_PERMISSION_REQUIRED');
      }
      const result = camera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 0.8,
          });
      if (!result.canceled) {
        setAsset(result.assets[0]);
        setProposal(null);
        upload.reset();
        actions.recognize.reset();
        actions.confirm.reset();
      }
    },
  });
  const busy =
    upload.isPending ||
    actions.recognize.isPending ||
    actions.confirm.isPending ||
    choose.isPending;
  const valid =
    proposal &&
    proposal.items.length > 0 &&
    proposal.items.every(
      (item) =>
        item.foodItemId &&
        item.quantity > 0 &&
        item.quantity <= 100000 &&
        (!item.expiryDate || isLocalIsoDate(item.expiryDate))
    );
  const run = async () => {
    try {
      const mediaId = upload.data || (await upload.mutateAsync());
      setProposal(
        reviewPantryProposal(await actions.recognize.mutateAsync(mediaId))
      );
    } catch {
      /* Mutation error is displayed below. */
    }
  };
  return (
    <ScreenWrapper
      scrollable
      contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg }}
      header={
        <CustomHeader
          title={vi ? 'Nhận diện nguyên liệu' : 'Recognize ingredients'}
          showBack
          backFallbackHref="/pantry"
        />
      }
    >
      <AppText color={colors.text.secondary}>
        {vi
          ? 'Chụp hoặc chọn ảnh. Kiểm tra tên, lượng và đơn vị trước khi lưu vào kho.'
          : 'Take or choose a photo. Verify the foods, quantities, and units before saving to your pantry.'}
      </AppText>
      <AppButton
        title={vi ? 'Chụp ảnh' : 'Take photo'}
        disabled={busy}
        onPress={() => choose.mutate(true)}
      />
      <AppButton
        title={vi ? 'Chọn ảnh' : 'Choose photo'}
        variant="outline"
        disabled={busy}
        onPress={() => choose.mutate(false)}
      />
      {asset ? (
        <Image
          source={{ uri: asset.uri }}
          accessibilityLabel={
            vi ? 'Ảnh nguyên liệu đã chọn' : 'Selected ingredient photo'
          }
          style={{ width: '100%', height: 220 }}
          resizeMode="contain"
        />
      ) : null}
      {asset && !proposal ? (
        <AppButton
          title={vi ? 'Nhận diện' : 'Recognize'}
          disabled={busy}
          loading={upload.isPending || actions.recognize.isPending}
          onPress={() => void run()}
        />
      ) : null}
      {proposal ? (
        <>
          {proposal.items.map((ingredient, index) => (
            <View
              key={ingredient.reviewKey}
              style={{
                padding: spacing.md,
                backgroundColor: colors.background.surface,
              }}
            >
              <IngredientReviewEditor
                ingredient={ingredient}
                disabled={busy}
                onChange={(next) =>
                  setProposal({
                    ...proposal,
                    items: proposal.items.map((item, current) =>
                      index === current ? next : item
                    ),
                  })
                }
                onRemove={() =>
                  setProposal({
                    ...proposal,
                    items: proposal.items.filter((_, current) => index !== current),
                  })
                }
              />
            </View>
          ))}
          <AppText>{proposal.disclaimer}</AppText>
          <AppButton
            title={vi ? 'Xác nhận thêm vào kho' : 'Confirm pantry additions'}
            loading={actions.confirm.isPending}
            disabled={!valid || busy}
            onPress={() =>
              actions.confirm.mutate(proposal, {
                onSuccess: () => router.replace('/pantry'),
              })
            }
          />
        </>
      ) : null}
      <FeatureState
        error={
          choose.error ||
          upload.error ||
          actions.recognize.error ||
          actions.confirm.error
        }
      />
    </ScreenWrapper>
  );
}
