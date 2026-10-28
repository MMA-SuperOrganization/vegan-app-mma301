import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth';
import { reminderApi } from './reminderApi';
export function useReminders() {
  const userId = useAuthStore((state) => state.user?.id);
  const client = useQueryClient();
  const key = ['account', userId, 'reminders'];
  const refresh = () => client.invalidateQueries({ queryKey: key });
  return {
    query: useQuery({ queryKey: key, queryFn: reminderApi.list }),
    create: useMutation({ mutationFn: reminderApi.create, onSuccess: refresh }),
    update: useMutation({
      mutationFn: ({
        id,
        input,
      }: {
        id: string;
        input: Parameters<typeof reminderApi.update>[1];
      }) => reminderApi.update(id, input),
      onSuccess: refresh,
    }),
    remove: useMutation({ mutationFn: reminderApi.remove, onSuccess: refresh }),
  };
}
