import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

test('recipe detail has no post social controls', () => {
  const recipeDetail = read(
    '../src/features/recipes/screens/RecipeDetailScreen.tsx'
  );

  assert.doesNotMatch(recipeDetail, /DiscussionPanel/);
  assert.doesNotMatch(recipeDetail, /RatingPanel/);
  assert.doesNotMatch(recipeDetail, /useRelatedRecipePosts/);
  assert.doesNotMatch(recipeDetail, /community\/post|community\/editor/);
});

test('home remains recipe-first and adds community posts afterwards', () => {
  const home = read('../src/features/recipes/screens/DiscoveryHomeScreen.tsx');
  const recipeStories = home.indexOf('<HomeRecipeStories');
  const community = home.indexOf('<HomeSocialPostCard');

  assert.ok(recipeStories >= 0);
  assert.ok(community > recipeStories);
  assert.match(home, /onCreatePost=\{/);
});

test('post owns share, reactions and comments while admin routes are guarded', () => {
  const post = read('../src/features/community/screens/PostDetailScreen.tsx');
  const reactions = read('../src/features/engagement/ReactionButtons.tsx');
  const adminLayout = read('../src/app/admin/_layout.tsx');

  assert.match(post, /Share\.share/);
  assert.match(post, /<ReactionButtons/);
  for (const type of ['like', 'love', 'helpful'])
    assert.match(reactions, new RegExp(`type: '${type}'`));
  assert.match(post, /Viết bình luận/);
  assert.match(adminLayout, /role !== 'admin'/);
});

test('post cards apply reactions optimistically without a loading-only heart state', () => {
  const hooks = read('../src/features/community/hooks.ts');
  const homeCard = read(
    '../src/features/community/components/HomeSocialPostCard.tsx'
  );
  const communityCard = read(
    '../src/features/community/components/CommunityPostCard.tsx'
  );
  const likeIcon = read('../src/features/community/components/PostLikeIcon.tsx');

  assert.match(hooks, /onMutate:/);
  assert.match(hooks, /updatePostReactionCache/);
  assert.match(hooks, /onError:/);
  assert.match(homeCard, /onPress={onReact}/);
  assert.match(homeCard, /accessibilityState=\{\{ selected: liked \}\}/);
  assert.match(communityCard, /onPress={onReact}/);
  assert.doesNotMatch(homeCard, /disabled=.*isPending/);
  assert.match(homeCard, /<PostLikeIcon liked={liked}/);
  assert.match(communityCard, /<PostLikeIcon liked={liked}/);
  assert.match(likeIcon, /liked \? 'heart-filled' : 'heart'/);
  assert.doesNotMatch(likeIcon, /backgroundColor/);
  assert.doesNotMatch(homeCard, /actionSelected/);
});

test('community uses an infinite newsfeed and publishes posts without admin review', () => {
  const community = read('../src/features/community/screens/CommunityScreen.tsx');
  const composer = read('../src/features/community/screens/PostEditorScreen.tsx');
  const postCard = read(
    '../src/features/community/components/CommunityPostCard.tsx'
  );

  assert.match(community, /Cộng đồng ăn xanh/);
  assert.match(community, /FlatList/);
  assert.match(community, /fetchNextPage/);
  assert.match(community, /onEndReached/);
  assert.match(community, /CommunityPostCard/);
  assert.match(composer, /Nội dung bài viết/);
  assert.match(composer, /Liên kết món ăn/);
  assert.match(composer, /Bắt buộc chọn ít nhất một nguyên liệu/);
  assert.match(composer, /Bài viết công khai sẽ xuất hiện ngay/);
  assert.match(composer, /'Đăng bài'/);
  assert.doesNotMatch(composer, /Gửi quản trị viên duyệt/);
  assert.match(postCard, /Có công thức/);
  assert.match(postCard, /PostFoodSummary/);
  assert.match(postCard, /!tag\.startsWith\('community-demo-'\)/);
});

test('home search includes recipes, posts, ingredients and videos by default', () => {
  const search = read('../src/features/recipes/screens/SearchScreen.tsx');
  const results = read('../src/features/recipes/screens/SearchResultsScreen.tsx');
  const filters = read(
    '../src/features/recipes/components/SearchResultsFilterBar.tsx'
  );
  const api = read('../src/features/recipes/recipeApi.ts');

  assert.match(search, /params: \{ q, type: 'all' \}/);
  assert.match(results, /'all', 'recipe', 'food-item', 'post', 'video'/);
  assert.match(results, /mixContentTypes/);
  assert.match(filters, /value: 'all'/);
  assert.match(filters, /value: 'post'/);
  assert.match(filters, /value: 'food-item'/);
  assert.match(api, /params: \{ q: query, type: 'all', limit: 8 \}/);
  assert.match(api, /type === 'all' \? 30 : 10/);
});
