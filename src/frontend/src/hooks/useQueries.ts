import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type {
  BinderView,
  BinderTheme,
  CardPosition,
  CardRarity,
  CardCondition,
  UserProfile,
  SubscriptionStatus,
  AdminContentSettings,
  UserAnalytics,
} from '../backend';
import { ExternalBlob } from '../backend';
import { Principal } from '@dfinity/principal';
import { withTimeout } from '../utils/promiseTimeout';

const QUERY_TIMEOUT = 30000;

export function useGetBinders() {
  const { actor, isFetching } = useActor();

  return useQuery<BinderView[]>({
    queryKey: ['binders'],
    queryFn: async () => {
      if (!actor) return [];
      console.log('[useGetBinders] Fetching binders...');
      const result = await withTimeout(actor.getBinders(), QUERY_TIMEOUT, 'getBinders');
      console.log('[useGetBinders] Fetched binders:', result.length);
      return result;
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
      console.log('[useCreateBinder] Creating binder:', name);
      return withTimeout(actor.createBinder(name, theme), QUERY_TIMEOUT, 'createBinder');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['binders'] });
    },
  });
}

export function useDeleteBinder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (binderId: string) => {
      if (!actor) throw new Error('Actor not available');
      console.log('[useDeleteBinder] Deleting binder:', binderId);
      return withTimeout(actor.deleteBinder(binderId), QUERY_TIMEOUT, 'deleteBinder');
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
      image,
      position,
      quantity,
      rarity,
      condition,
    }: {
      binderId: string;
      name: string;
      image: ExternalBlob;
      position: CardPosition;
      quantity: bigint;
      rarity: CardRarity;
      condition: CardCondition;
    }) => {
      if (!actor) throw new Error('Actor not available');
      console.log('[useAddPhotocard] Adding photocard to binder:', binderId);
      return withTimeout(
        actor.addPhotocard(binderId, name, image, position, quantity, rarity, condition),
        QUERY_TIMEOUT,
        'addPhotocard'
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['binders'] });
    },
  });
}

export function useUpdatePhotocard() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      binderId,
      cardId,
      name,
      image,
      position,
      quantity,
      rarity,
      condition,
    }: {
      binderId: string;
      cardId: string;
      name: string;
      image: ExternalBlob;
      position: CardPosition;
      quantity: bigint;
      rarity: CardRarity;
      condition: CardCondition;
    }) => {
      if (!actor) throw new Error('Actor not available');
      console.log('[useUpdatePhotocard] Updating photocard:', cardId);
      return withTimeout(
        actor.updatePhotocard(binderId, cardId, name, image, position, quantity, rarity, condition),
        QUERY_TIMEOUT,
        'updatePhotocard'
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['binders'] });
    },
  });
}

export function useDeletePhotocard() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ binderId, cardId }: { binderId: string; cardId: string }) => {
      if (!actor) throw new Error('Actor not available');
      console.log('[useDeletePhotocard] Deleting photocard:', cardId);
      return withTimeout(actor.deletePhotocard(binderId, cardId), QUERY_TIMEOUT, 'deletePhotocard');
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
      console.log('[useUpdateBinderTheme] Updating binder theme:', binderId);
      return withTimeout(actor.updateBinderTheme(binderId, theme), QUERY_TIMEOUT, 'updateBinderTheme');
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
      console.log('[useReorderCards] Reordering cards in binder:', binderId);
      return withTimeout(actor.reorderCards(binderId, newOrder), QUERY_TIMEOUT, 'reorderCards');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['binders'] });
    },
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      console.log('[useGetCallerUserProfile] Fetching user profile...');
      return withTimeout(actor.getCallerUserProfile(), QUERY_TIMEOUT, 'getCallerUserProfile');
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
      console.log('[useSaveCallerUserProfile] Saving user profile...');
      return withTimeout(actor.saveCallerUserProfile(profile), QUERY_TIMEOUT, 'saveCallerUserProfile');
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
      console.log('[useGetSubscriptionStatus] Fetching subscription status...');
      return withTimeout(actor.getSubscriptionStatus(), QUERY_TIMEOUT, 'getSubscriptionStatus');
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAdminContentSettings() {
  const { actor, isFetching } = useActor();

  return useQuery<AdminContentSettings>({
    queryKey: ['adminContentSettings'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      console.log('[useGetAdminContentSettings] Fetching admin content settings...');
      return withTimeout(actor.getAdminContentSettings(), QUERY_TIMEOUT, 'getAdminContentSettings');
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateAdminContentSettings() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: AdminContentSettings) => {
      if (!actor) throw new Error('Actor not available');
      console.log('[useUpdateAdminContentSettings] Updating admin content settings...');
      return withTimeout(
        actor.updateAdminContentSettings(settings),
        QUERY_TIMEOUT,
        'updateAdminContentSettings'
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminContentSettings'] });
    },
  });
}

export function useVerifyMasterAdminKey() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (key: string) => {
      if (!actor) throw new Error('Actor not available');
      console.log('[useVerifyMasterAdminKey] Verifying master admin key...');
      return withTimeout(actor.authenticateMasterAdminKey(key), QUERY_TIMEOUT, 'authenticateMasterAdminKey');
    },
  });
}

export function useUpdateMasterAdminKey() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newKey: string) => {
      if (!actor) throw new Error('Actor not available');
      console.log('[useUpdateMasterAdminKey] Updating master admin key...');
      return withTimeout(actor.updateMasterAdminKey(newKey), QUERY_TIMEOUT, 'updateMasterAdminKey');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminContentSettings'] });
    },
  });
}

export function useGetAllUsers() {
  const { actor, isFetching } = useActor();

  return useQuery<UserAnalytics[]>({
    queryKey: ['allUsers'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      console.log('[useGetAllUsers] Fetching all users...');
      return withTimeout(actor.getAllUsers(), QUERY_TIMEOUT, 'getAllUsers');
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetFilteredUsers() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (filter: string) => {
      if (!actor) throw new Error('Actor not available');
      console.log('[useGetFilteredUsers] Filtering users by:', filter);
      return withTimeout(actor.getFilteredUsers(filter), QUERY_TIMEOUT, 'getFilteredUsers');
    },
  });
}

export function useGetBindersByUser() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (userPrincipal: Principal) => {
      if (!actor) throw new Error('Actor not available');
      console.log('[useGetBindersByUser] Fetching binders for user:', userPrincipal.toString());
      return withTimeout(actor.getBindersByUser(userPrincipal), QUERY_TIMEOUT, 'getBindersByUser');
    },
  });
}

export function useUpdateSubscriptionStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, status }: { user: Principal; status: SubscriptionStatus }) => {
      if (!actor) throw new Error('Actor not available');
      console.log('[useUpdateSubscriptionStatus] Updating subscription status for user:', user.toString());
      return withTimeout(actor.updateSubscriptionStatus(user, status), QUERY_TIMEOUT, 'updateSubscriptionStatus');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
    },
  });
}

export function useGetLayoutPresets() {
  const { actor, isFetching } = useActor();

  return useQuery<string[]>({
    queryKey: ['layoutPresets'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      console.log('[useGetLayoutPresets] Fetching layout presets...');
      return withTimeout(actor.getLayoutPresets(), QUERY_TIMEOUT, 'getLayoutPresets');
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddLayoutPreset() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (layout: string) => {
      if (!actor) throw new Error('Actor not available');
      console.log('[useAddLayoutPreset] Adding layout preset:', layout);
      return withTimeout(actor.addLayoutPreset(layout), QUERY_TIMEOUT, 'addLayoutPreset');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['layoutPresets'] });
    },
  });
}

export function useRemoveLayoutPreset() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (layout: string) => {
      if (!actor) throw new Error('Actor not available');
      console.log('[useRemoveLayoutPreset] Removing layout preset:', layout);
      return withTimeout(actor.removeLayoutPreset(layout), QUERY_TIMEOUT, 'removeLayoutPreset');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['layoutPresets'] });
    },
  });
}

export function useGetDefaultLayout() {
  const { actor, isFetching } = useActor();

  return useQuery<string>({
    queryKey: ['defaultLayout'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      console.log('[useGetDefaultLayout] Fetching default layout...');
      return withTimeout(actor.getDefaultLayout(), QUERY_TIMEOUT, 'getDefaultLayout');
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetDefaultLayout() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (layout: string) => {
      if (!actor) throw new Error('Actor not available');
      console.log('[useSetDefaultLayout] Setting default layout:', layout);
      return withTimeout(actor.setDefaultLayout(layout), QUERY_TIMEOUT, 'setDefaultLayout');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['defaultLayout'] });
    },
  });
}

export function useGetUserLayout() {
  const { actor, isFetching } = useActor();

  return useQuery<string>({
    queryKey: ['userLayout'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      console.log('[useGetUserLayout] Fetching user layout preference...');
      return withTimeout(actor.getUserLayout(), QUERY_TIMEOUT, 'getUserLayout');
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateUserLayout() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (layout: string) => {
      if (!actor) throw new Error('Actor not available');
      console.log('[useUpdateUserLayout] Updating user layout preference:', layout);
      return withTimeout(actor.updateUserLayout(layout), QUERY_TIMEOUT, 'updateUserLayout');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userLayout'] });
      queryClient.invalidateQueries({ queryKey: ['binders'] });
    },
  });
}

export function useSaveStripeKeys() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ publishableKey, secretKey }: { publishableKey: string; secretKey: string }) => {
      if (!actor) throw new Error('Actor not available');
      console.log('[useSaveStripeKeys] Saving Stripe keys...');
      return withTimeout(actor.saveStripeKeys(publishableKey, secretKey), QUERY_TIMEOUT, 'saveStripeKeys');
    },
  });
}
