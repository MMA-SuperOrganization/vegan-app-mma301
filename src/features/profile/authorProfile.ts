import type { useRouter } from 'expo-router';

/** Opens the public profile of a post or comment author (FR-PROFILE-05). */
export function openAuthorProfile(
  router: Pick<ReturnType<typeof useRouter>, 'push'>,
  authorId: string
) {
  router.push({ pathname: '/users/[id]', params: { id: authorId } });
}
