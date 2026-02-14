import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { useAccentColor } from './hooks/useAccentColor';
import { useLoadingDiagnostics } from './hooks/useLoadingDiagnostics';
import { useActor } from './hooks/useActor';
import { useState } from 'react';
import LoginPanel from './features/auth/LoginPanel';
import ProfileSetupModal from './features/auth/ProfileSetupModal';
import AppLayout from './components/layout/AppLayout';
import BinderLibraryScreen from './screens/BinderLibraryScreen';
import BinderViewScreen from './screens/BinderViewScreen';
import AddCardScreen from './screens/AddCardScreen';
import EditCardScreen from './screens/EditCardScreen';
import BinderSettingsScreen from './screens/BinderSettingsScreen';
import GlobalLoadingGate from './components/system/GlobalLoadingGate';

type Screen = 
  | { type: 'library' }
  | { type: 'binder'; binderId: string }
  | { type: 'addCard'; binderId: string }
  | { type: 'editCard'; binderId: string; cardId: string }
  | { type: 'settings'; binderId: string };

export default function App() {
  const { identity } = useInternetIdentity();
  const { actor } = useActor();
  const { data: userProfile, isLoading: profileLoading, isFetched, error: profileError, refetch: refetchProfile } = useGetCallerUserProfile();
  const [currentScreen, setCurrentScreen] = useState<Screen>({ type: 'library' });
  
  // Initialize accent color (applies to both authenticated and unauthenticated views)
  useAccentColor();

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  // Loading diagnostics
  useLoadingDiagnostics({
    actorReady: !!actor,
    profileLoading,
    profileError: !!profileError,
  });

  if (!isAuthenticated) {
    return <LoginPanel />;
  }

  if (showProfileSetup) {
    return <ProfileSetupModal />;
  }

  // Show loading gate with error handling and retry
  const isLoading = profileLoading || !isFetched;
  if (isLoading || profileError) {
    return (
      <GlobalLoadingGate
        isLoading={isLoading}
        error={profileError as Error | null}
        onRetry={() => refetchProfile()}
        loadingMessage="Loading your binders..."
        errorTitle="Unable to load your profile"
      />
    );
  }

  return (
    <AppLayout onNavigateHome={() => setCurrentScreen({ type: 'library' })}>
      {currentScreen.type === 'library' && (
        <BinderLibraryScreen onOpenBinder={(binderId) => setCurrentScreen({ type: 'binder', binderId })} />
      )}
      {currentScreen.type === 'binder' && (
        <BinderViewScreen
          binderId={currentScreen.binderId}
          onBack={() => setCurrentScreen({ type: 'library' })}
          onAddCard={() => setCurrentScreen({ type: 'addCard', binderId: currentScreen.binderId })}
          onEditCard={(cardId) => setCurrentScreen({ type: 'editCard', binderId: currentScreen.binderId, cardId })}
          onSettings={() => setCurrentScreen({ type: 'settings', binderId: currentScreen.binderId })}
        />
      )}
      {currentScreen.type === 'addCard' && (
        <AddCardScreen
          binderId={currentScreen.binderId}
          onBack={() => setCurrentScreen({ type: 'binder', binderId: currentScreen.binderId })}
          onSuccess={() => setCurrentScreen({ type: 'binder', binderId: currentScreen.binderId })}
        />
      )}
      {currentScreen.type === 'editCard' && (
        <EditCardScreen
          binderId={currentScreen.binderId}
          cardId={currentScreen.cardId}
          onBack={() => setCurrentScreen({ type: 'binder', binderId: currentScreen.binderId })}
          onSave={() => setCurrentScreen({ type: 'binder', binderId: currentScreen.binderId })}
        />
      )}
      {currentScreen.type === 'settings' && (
        <BinderSettingsScreen
          binderId={currentScreen.binderId}
          onBack={() => setCurrentScreen({ type: 'binder', binderId: currentScreen.binderId })}
        />
      )}
    </AppLayout>
  );
}
