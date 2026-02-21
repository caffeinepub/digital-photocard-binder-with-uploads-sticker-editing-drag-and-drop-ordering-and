import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { BinderView, BinderTheme, UserProfile, CardPosition, SubscriptionStatus, AdminContentSettings, UserAnalytics } from '../backend';
import { ExternalBlob, CardRarity, CardCondition } from '../backend';
import { withTimeout } from '../utils/promiseTimeout';
import { Principal } from '@dfinity/principal';
import { useInternetIdentity } from './useInternetIdentity';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      console.log('[useQueries] Fetching caller user profile...');
      const result = await withTimeout(
        actor.getCallerUserProfile(),
        30000,
        'Profile fetch timed out - please check your connection'
      );
      console.log('[useQueries] Profile fetch result:', result ? 'Profile found' : 'No profile');
      return result;
    },
    enabled: !!actor && !actorFetching,
    retry: 1,
    retryDelay: 1000,
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

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return withTimeout(
        actor.isCallerAdmin(),
        30000,
        'Admin check timed out'
      );
    },
    enabled: !!actor && !isFetching,
    retry: 1,
    retryDelay: 1000,
  });
}

export function useGetSubscriptionStatus() {
  const { actor, isFetching } = useActor();

  return useQuery<SubscriptionStatus>({
    queryKey: ['subscriptionStatus'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return withTimeout(
        actor.getSubscriptionStatus(),
        30000,
        'Subscription status fetch timed out'
      );
    },
    enabled: !!actor && !isFetching,
    retry: 1,
    retryDelay: 1000,
  });
}

export function useGetBinders() {
  const { actor, isFetching } = useActor();

  return useQuery<BinderView[]>({
    queryKey: ['binders'],
    queryFn: async () => {
      if (!actor) {
        console.log('[useQueries] getBinders: Actor not available');
        return [];
      }
      console.log('[useQueries] Fetching binders...');
      try {
        const binders = await withTimeout(
          actor.getBinders(),
          30000,
          'Binders fetch timed out - please check your connection'
        );
        console.log('[useQueries] Binders fetched successfully:', {
          count: binders.length,
          binderIds: binders.map(b => b.id),
          cardCounts: binders.map(b => ({ id: b.id, cards: b.cards.length }))
        });
        
        // Log detailed info about first binder if available
        if (binders.length > 0) {
          const firstBinder = binders[0];
          console.log('[useQueries] First binder details:', {
            id: firstBinder.id,
            name: firstBinder.name,
            cardsCount: firstBinder.cards.length,
            sampleCard: firstBinder.cards[0] ? {
              id: firstBinder.cards[0].id,
              name: firstBinder.cards[0].name,
              hasImage: !!firstBinder.cards[0].image
            } : 'No cards'
          });
        }
        
        return binders;
      } catch (error) {
        console.error('[useQueries] Binders fetch error:', error);
        throw error;
      }
    },
    enabled: !!actor && !isFetching,
    retry: 1,
    retryDelay: 1000,
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
      
      // Add default rarity and condition values for new cards
      return actor.addPhotocard(
        binderId,
        name,
        blob,
        position,
        quantity,
        CardRarity.none,
        CardCondition.none
      );
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

// Admin: Content Settings
export function useGetAdminContentSettings() {
  const { actor, isFetching } = useActor();

  return useQuery<AdminContentSettings>({
    queryKey: ['adminContentSettings'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return withTimeout(
        actor.getAdminContentSettings(),
        30000,
        'Content settings fetch timed out'
      );
    },
    enabled: !!actor && !isFetching,
    retry: 1,
    retryDelay: 1000,
    refetchInterval: 60000, // Refetch every 60 seconds for automatic updates
    staleTime: 30000,
  });
}

export function useUpdateAdminContentSettings() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: AdminContentSettings) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateAdminContentSettings(settings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminContentSettings'] });
    },
  });
}

// Admin: Master Admin Key Management
export function useVerifyMasterAdminKey() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (key: string) => {
      if (!actor) {
        console.error('[useVerifyMasterAdminKey] Actor not available');
        throw new Error('Actor not available');
      }
      
      console.log('[useVerifyMasterAdminKey] Fetching stored master admin key...');
      try {
        const storedKey = await actor.getMasterAdminKey();
        console.log('[useVerifyMasterAdminKey] Stored key retrieved:', storedKey ? 'Key exists (masked)' : 'No key stored');
        console.log('[useVerifyMasterAdminKey] Input key length:', key.length);
        
        // Handle null case explicitly
        if (storedKey === null) {
          console.error('[useVerifyMasterAdminKey] No master admin key is stored in backend');
          return false;
        }
        
        const isValid = storedKey === key;
        console.log('[useVerifyMasterAdminKey] Verification result:', isValid ? 'Valid' : 'Invalid');
        return isValid;
      } catch (error) {
        console.error('[useVerifyMasterAdminKey] Error during verification:', error);
        throw error;
      }
    },
  });
}

export function useUpdateMasterAdminKey() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newKey: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateMasterAdminKey(newKey);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminContentSettings'] });
    },
  });
}

// Admin: User Analytics
export function useGetAllUsers() {
  const { actor, isFetching } = useActor();

  return useQuery<UserAnalytics[]>({
    queryKey: ['allUsers'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return withTimeout(
        actor.getAllUsers(),
        30000,
        'User analytics fetch timed out'
      );
    },
    enabled: !!actor && !isFetching,
    retry: 1,
    retryDelay: 1000,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export function useGetFilteredUsers() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (filter: string) => {
      if (!actor) throw new Error('Actor not available');
      return withTimeout(
        actor.getFilteredUsers(filter),
        30000,
        'User search timed out'
      );
    },
  });
}

export function useGetBindersByUser() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (userPrincipal: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return withTimeout(
        actor.getBindersByUser(userPrincipal),
        30000,
        'User binders fetch timed out'
      );
    },
  });
}

// Grid Layout Preferences
export function useGetUserLayout() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<string>({
    queryKey: ['userLayout'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      if (!identity) throw new Error('Identity not available');
      
      console.log('[useQueries] Fetching user layout...');
      try {
        // Backend getUserLayout() uses caller's principal automatically
        const layout = await withTimeout(
          actor.getUserLayout(),
          30000,
          'Layout preference fetch timed out'
        );
        console.log('[useQueries] User layout fetched:', layout);
        return layout;
      } catch (error) {
        console.error('[useQueries] User layout fetch error:', error);
        throw error;
      }
    },
    enabled: !!actor && !isFetching && !!identity,
    retry: 1,
    retryDelay: 1000,
  });
}

export function useGetLayoutPresets() {
  const { actor, isFetching } = useActor();

  return useQuery<string[]>({
    queryKey: ['layoutPresets'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return withTimeout(
        actor.getLayoutPresets(),
        30000,
        'Layout presets fetch timed out'
      );
    },
    enabled: !!actor && !isFetching,
    retry: 1,
    retryDelay: 1000,
  });
}

export function useGetDefaultLayout() {
  const { actor, isFetching } = useActor();

  return useQuery<string>({
    queryKey: ['defaultLayout'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      console.log('[useQueries] Fetching default layout...');
      try {
        const layout = await withTimeout(
          actor.getDefaultLayout(),
          30000,
          'Default layout fetch timed out'
        );
        console.log('[useQueries] Default layout fetched:', layout);
        return layout;
      } catch (error) {
        console.error('[useQueries] Default layout fetch error:', error);
        throw error;
      }
    },
    enabled: !!actor && !isFetching,
    retry: 1,
    retryDelay: 1000,
  });
}

export function useUpdateUserLayout() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (layout: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateUserLayout(layout);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userLayout'] });
      queryClient.invalidateQueries({ queryKey: ['binders'] });
    },
  });
}

// Admin: Layout Preset Management
export function useAddLayoutPreset() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (layout: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addLayoutPreset(layout);
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
      return actor.removeLayoutPreset(layout);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['layoutPresets'] });
    },
  });
}

export function useSetDefaultLayout() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (layout: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setDefaultLayout(layout);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['defaultLayout'] });
    },
  });
}

// Stripe Payment Integration
export function useSaveStripeKeys() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ publishableKey, secretKey }: { publishableKey: string; secretKey: string }) => {
      if (!actor) throw new Error('Actor not available');
      return withTimeout(
        actor.saveStripeKeys(publishableKey, secretKey),
        30000,
        'Stripe keys save timed out'
      );
    },
  });
}

export function useGetStripePublishableKey() {
  const { actor, isFetching } = useActor();

  return useQuery<string>({
    queryKey: ['stripePublishableKey'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return withTimeout(
        actor.getStripePublishableKey(),
        30000,
        'Stripe publishable key fetch timed out'
      );
    },
    enabled: !!actor && !isFetching,
    retry: 1,
    retryDelay: 1000,
  });
}

export function useIsStripeConfigured() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isStripeConfigured'],
    queryFn: async () => {
      if (!actor) return false;
      return withTimeout(
        actor.isStripeConfigured(),
        30000,
        'Stripe configuration check timed out'
      );
    },
    enabled: !!actor && !isFetching,
    retry: 1,
    retryDelay: 1000,
  });
}
