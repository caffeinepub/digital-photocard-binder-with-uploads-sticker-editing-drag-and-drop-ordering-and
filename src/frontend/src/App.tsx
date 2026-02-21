import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { useAccentColor } from './hooks/useAccentColor';
import { useLoadingDiagnostics } from './hooks/useLoadingDiagnostics';
import { useActor } from './hooks/useActor';
import { useState, useEffect } from 'react';
import { isSuperuserEmail } from './config/admin';
import LoginPanel from './features/auth/LoginPanel';
import ProfileSetupModal from './features/auth/ProfileSetupModal';
import AppLayout from './components/layout/AppLayout';
import BinderLibraryScreen from './screens/BinderLibraryScreen';
import BinderViewScreen from './screens/BinderViewScreen';
import AddCardScreen from './screens/AddCardScreen';
import EditCardScreen from './screens/EditCardScreen';
import BinderSettingsScreen from './screens/BinderSettingsScreen';
import AdminDashboardScreen from './screens/AdminDashboardScreen';
import GlobalLoadingGate from './components/system/GlobalLoadingGate';

type Screen = 
  | { type: 'library' }
  | { type: 'binder'; binderId: string }
  | { type: 'addCard'; binderId: string }
  | { type: 'editCard'; binderId: string; cardId: string }
  | { type: 'settings'; binderId: string }
  | { type: 'admin' };

export default function App() {
  const { identity } = useInternetIdentity();
  const { actor } = useActor();
  const { data: userProfile, isLoading: profileLoading, isFetched, error: profileError, refetch: refetchProfile } = useGetCallerUserProfile();
  const [currentScreen, setCurrentScreen] = useState<Screen>({ type: 'library' });
  const [globalAlert, setGlobalAlert] = useState<string | null>(null);
  
  // Initialize accent color (applies to both authenticated and unauthenticated views)
  useAccentColor();

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  // Determine if user is a superuser based on email
  const isSuperuser = userProfile ? isSuperuserEmail(userProfile.email) : false;

  // Loading diagnostics
  useLoadingDiagnostics({
    actorReady: !!actor,
    profileLoading,
    profileError: !!profileError,
  });

  // Handle /admin-portal route via browser location
  useEffect(() => {
    if (!isAuthenticated || !userProfile) return;

    const path = window.location.pathname;
    if (path === '/admin-portal') {
      if (isSuperuser) {
        setCurrentScreen({ type: 'admin' });
      } else {
        // Redirect non-superusers back to library with 404 message
        setCurrentScreen({ type: 'library' });
        window.history.replaceState(null, '', '/');
        setGlobalAlert('404 Not Found');
        setTimeout(() => setGlobalAlert(null), 5000);
      }
    }
  }, [isAuthenticated, userProfile, isSuperuser]);

  // Handle navigation to admin portal
  const handleNavigateAdmin = () => {
    if (isSuperuser) {
      setCurrentScreen({ type: 'admin' });
      window.history.pushState(null, '', '/admin-portal');
      setGlobalAlert(null);
    }
  };

  // Handle navigation home
  const handleNavigateHome = () => {
    setCurrentScreen({ type: 'library' });
    window.history.replaceState(null, '', '/');
    setGlobalAlert(null);
  };

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
    <AppLayout 
      onNavigateHome={handleNavigateHome}
      onNavigateAdmin={handleNavigateAdmin}
      isSuperuser={isSuperuser}
      globalAlert={globalAlert}
      onDismissAlert={() => setGlobalAlert(null)}
    >
      {currentScreen.type === 'library' && (
        <BinderLibraryScreen onOpenBinder={(binderId) => setCurrentScreen({ type: 'binder', binderId })} />
      )}
      {currentScreen.type === 'binder' && (
        <BinderViewScreen
          binderId={currentScreen.binderId}
          onBack={handleNavigateHome}
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
      {currentScreen.type === 'admin' && isSuperuser && (
        <AdminDashboardScreen />
      )}
    </AppLayout>
  );
}
