import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { BinderView, BinderTheme, UserProfile, CardPosition, SubscriptionStatus } from '../backend';
import { ExternalBlob } from '../backend';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetSubscriptionStatus() {
  const { actor, isFetching } = useActor();

  return useQuery<SubscriptionStatus>({
    queryKey: ['subscriptionStatus'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getSubscriptionStatus();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetBinders() {
  const { actor, isFetching } = useActor();

  return useQuery<BinderView[]>({
    queryKey: ['binders'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getBinders();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateBinder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, theme }: { name: string; theme: BinderTheme }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createBinder(name, theme);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['binders'] });
    },
    onError: (error) => {
      // Log detailed error for debugging
      console.error('Binder creation failed:', error);
    },
  });
}

export function useDeleteBinder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (binderId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteBinder(binderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['binders'] });
    },
  });
}

export function useUpdateBinderTheme() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ binderId, theme }: { binderId: string; theme: BinderTheme }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateBinderTheme(binderId, theme);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['binders'] });
    },
  });
}

export function useAddPhotocard() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      binderId,
      name,
      imageBytes,
      position,
      quantity,
      onProgress,
    }: {
      binderId: string;
      name: string;
      imageBytes: Uint8Array;
      position: CardPosition;
      quantity: bigint;
      onProgress?: (percentage: number) => void;
    }) => {
      if (!actor) throw new Error('Actor not available');
      
      // Cast to the expected type for ExternalBlob.fromBytes
      const typedBytes = new Uint8Array(imageBytes.buffer) as Uint8Array<ArrayBuffer>;
      let blob = ExternalBlob.fromBytes(typedBytes);
      if (onProgress) {
        blob = blob.withUploadProgress(onProgress);
      }
      
      return actor.addPhotocard(binderId, name, blob, position, quantity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['binders'] });
    },
  });
}

export function useReorderCards() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ binderId, newOrder }: { binderId: string; newOrder: string[] }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.reorderCards(binderId, newOrder);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['binders'] });
    },
  });
}
