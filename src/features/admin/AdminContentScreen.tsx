import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import {
  AppButton,
  AppInput,
  AppText,
  CustomHeader,
  ScreenWrapper,
  appDialog,
} from '@/components';
import { FeatureState } from '@/components/feedback/FeatureState';
import { useTranslation } from '@/i18n';
import { colors, spacing, webLayout } from '@/theme';
import { adminApi } from './adminApi';
import {
  AdminEmptyState,
  AdminFilterChips,
  AdminSectionHeader,
  AdminStatusBadge,
  AdminSurface,
} from './AdminUi';

type StatusFilter = 'all' | 'published' | 'draft' | 'hidden' | 'deleted';

export function AdminContentScreen() {
  const router = useRouter();
  const { locale } = useTranslation();
  const vi = locale === 'vi';
  const client = useQueryClient();
  const [text, setText] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const posts = useInfiniteQuery({
    queryKey: ['admin', 'posts', search, status],
    queryFn: ({ pageParam }) =>
      adminApi.posts({ page: pageParam, q: search, status }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const meta = lastPage.meta;
      return meta && meta.page < meta.totalPages ? meta.page + 1 : undefined;
    },
  });
  const remove = useMutation({
    mutationFn: adminApi.removePost,
    onSuccess: () => client.invalidateQueries({ queryKey: ['admin'] }),
  });
  const rows = useMemo(
    () => posts.data?.pages.flatMap((page) => page.data) ?? [],
    [posts.data]
  );
  const filters: Array<{ value: StatusFilter; label: string }> = [
    { value: 'all', label: vi ? 'Tất cả đang hoạt động' : 'All active' },
    { value: 'published', label: vi ? 'Đã đăng' : 'Published' },
    { value: 'draft', label: vi ? 'Bản nháp' : 'Draft' },
    { value: 'hidden', label: vi ? 'Đã ẩn' : 'Hidden' },
    { value: 'deleted', label: vi ? 'Đã xóa' : 'Deleted' },
  ];
  const confirmDelete = (id: string, title: string) =>
    appDialog.alert(vi ? 'Xóa bài viết?' : 'Delete post?', title, [
      { text: vi ? 'Hủy' : 'Cancel', style: 'cancel' },
      {
        text: vi ? 'Xóa' : 'Delete',
        style: 'destructive',
        onPress: () => remove.mutate(id),
      },
    ]);

  return (
    <ScreenWrapper
      scrollable
      webMaxWidth={webLayout.catalogMaxWidth}
      contentContainerStyle={styles.screen}
      header={
        <CustomHeader
          title={vi ? 'Quản trị bài viết' : 'Post management'}
          showBack={false}
        />
      }
    >
      <AdminSurface>
        <AppInput
          type="search"
          label={vi ? 'Tìm bài viết' : 'Search posts'}
          value={text}
          onChangeText={setText}
          onSubmitEditing={() => setSearch(text.trim())}
          returnKeyType="search"
        />
        <AdminFilterChips value={status} options={filters} onChange={setStatus} />
        <AppButton
          title={vi ? 'Tạo bài viết mới' : 'Create post'}
          onPress={() => router.push('/community/editor')}
        />
      </AdminSurface>

      <FeatureState
        loading={posts.isLoading}
        error={posts.error || remove.error}
        retry={() => void posts.refetch()}
      />
      {posts.data ? (
        <AdminSectionHeader
          title={vi ? 'Danh sách bài viết' : 'Post list'}
          description={`${rows.length}/${posts.data.pages[0]?.meta?.total ?? rows.length}`}
        />
      ) : null}
      {posts.data && !rows.length ? (
        <AdminEmptyState
          icon="explore"
          title={vi ? 'Không có bài viết phù hợp' : 'No matching posts'}
          description={
            vi ? 'Thử đổi từ khóa hoặc trạng thái.' : 'Try another search or status.'
          }
        />
      ) : null}
      <View style={styles.list}>
        {rows.map((post) => (
          <AdminSurface key={post._id}>
            <View style={styles.rowHeader}>
              <View style={styles.identity}>
                <AppText variant="heading4" numberOfLines={2}>
                  {post.title}
                </AppText>
                <AppText
                  variant="bodySmall"
                  color={colors.text.secondary}
                  numberOfLines={2}
                >
                  {post.content}
                </AppText>
              </View>
              <AdminStatusBadge
                label={post.status}
                tone={
                  post.status === 'published'
                    ? 'success'
                    : post.status === 'hidden'
                      ? 'danger'
                      : 'neutral'
                }
              />
            </View>
            <AppText variant="caption" color={colors.text.secondary}>
              {`${post.viewCount ?? 0} ${vi ? 'lượt xem' : 'views'} · ${post.reactionCount ?? 0} ${vi ? 'tương tác' : 'reactions'} · ${post.commentCount ?? 0} ${vi ? 'bình luận' : 'comments'}`}
            </AppText>
            {post.status !== 'deleted' ? (
              <View style={styles.actions}>
                <AppButton
                  title={vi ? 'Sửa' : 'Edit'}
                  variant="outline"
                  fullWidth={false}
                  onPress={() =>
                    router.push({
                      pathname: '/community/editor',
                      params: { id: post._id },
                    })
                  }
                />
                <AppButton
                  title={vi ? 'Xóa' : 'Delete'}
                  variant="danger"
                  fullWidth={false}
                  disabled={remove.isPending}
                  onPress={() => confirmDelete(post._id, post.title)}
                />
              </View>
            ) : null}
          </AdminSurface>
        ))}
      </View>
      {posts.hasNextPage ? (
        <AppButton
          title={vi ? 'Tải thêm' : 'Load more'}
          variant="outline"
          loading={posts.isFetchingNextPage}
          onPress={() => void posts.fetchNextPage()}
        />
      ) : null}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  screen: { padding: spacing.xl, paddingBottom: spacing['4xl'], gap: spacing.lg },
  list: { gap: spacing.md },
  rowHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  identity: { flex: 1, minWidth: 0, gap: spacing.xs },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
