import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import { useAccentColor } from './hooks/useAccentColor';
import { useState } from 'react';
import LoginPanel from './features/auth/LoginPanel';
import ProfileSetupModal from './features/auth/ProfileSetupModal';
import AppLayout from './components/layout/AppLayout';
import BinderLibraryScreen from './screens/BinderLibraryScreen';
import BinderViewScreen from './screens/BinderViewScreen';
import AddCardScreen from './screens/AddCardScreen';
import EditCardScreen from './screens/EditCardScreen';
import BinderSettingsScreen from './screens/BinderSettingsScreen';

type Screen = 
  | { type: 'library' }
  | { type: 'binder'; binderId: string }
  | { type: 'addCard'; binderId: string }
  | { type: 'editCard'; binderId: string; cardId: string }
  | { type: 'settings'; binderId: string };

export default function App() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const [currentScreen, setCurrentScreen] = useState<Screen>({ type: 'library' });
  
  // Initialize accent color (applies to both authenticated and unauthenticated views)
  useAccentColor();

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  if (!isAuthenticated) {
    return <LoginPanel />;
  }

  if (showProfileSetup) {
    return <ProfileSetupModal />;
  }

  if (profileLoading || !isFetched) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-binder-dark">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-binder-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-binder-text-muted">Loading your binders...</p>
        </div>
      </div>
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
