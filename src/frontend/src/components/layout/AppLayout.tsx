import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { BookHeart, LogOut, Heart, Shield, User, X } from 'lucide-react';
import { ReactNode, useState } from 'react';
import AccentColorSelector from './AccentColorSelector';
import TermsAndConditionsDialog from '../terms/TermsAndConditionsDialog';
import ProfileSettingsDialog from '../../features/auth/ProfileSettingsDialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BUILD_INFO } from '../../config/buildInfo';

interface AppLayoutProps {
  children: ReactNode;
  onNavigateHome: () => void;
  onNavigateAdmin?: () => void;
  isSuperuser?: boolean;
  globalAlert?: string | null;
  onDismissAlert?: () => void;
}

export default function AppLayout({ 
  children, 
  onNavigateHome, 
  onNavigateAdmin, 
  isSuperuser,
  globalAlert,
  onDismissAlert 
}: AppLayoutProps) {
  const { clear } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const queryClient = useQueryClient();
  const [showTerms, setShowTerms] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  return (
    <div className="min-h-screen bg-binder-dark">
      <header className="bg-binder-surface/95 backdrop-blur-sm border-b border-binder-border sticky top-0 z-50 shadow-binder">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onNavigateHome}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="w-10 h-10 bg-binder-accent/20 rounded-lg flex items-center justify-center">
                <BookHeart className="w-6 h-6 text-binder-accent" />
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-bold text-binder-text font-display">
                  Photocard Binder
                </h1>
              </div>
            </button>

            <div className="flex items-center gap-3">
              <AccentColorSelector />
              {isSuperuser && onNavigateAdmin && (
                <Button
                  onClick={onNavigateAdmin}
                  variant="outline"
                  size="sm"
                  className="rounded-lg border border-binder-accent/50 hover:border-binder-accent hover:bg-binder-accent/10 bg-transparent text-binder-accent"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Admin
                </Button>
              )}
              {userProfile && (
                <Button
                  onClick={() => setShowProfileSettings(true)}
                  variant="ghost"
                  size="sm"
                  className="rounded-lg text-binder-text-muted hover:text-binder-text hover:bg-binder-surface"
                >
                  <User className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">
                    {userProfile.displayName || userProfile.name}
                  </span>
                </Button>
              )}
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="rounded-lg border border-binder-border hover:border-binder-accent hover:bg-binder-accent/10 bg-transparent text-binder-text"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {globalAlert && (
        <div className="container mx-auto px-4 pt-4">
          <Alert variant="destructive" className="relative">
            <AlertDescription className="pr-8">{globalAlert}</AlertDescription>
            {onDismissAlert && (
              <button
                onClick={onDismissAlert}
                className="absolute right-2 top-2 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </Alert>
        </div>
      )}

      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="bg-binder-surface/80 backdrop-blur-sm border-t border-binder-border mt-16 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-binder-text-muted">
          <p className="flex items-center justify-center gap-2">
            Built with <Heart className="w-4 h-4 text-binder-accent fill-binder-accent" /> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-binder-accent hover:underline font-medium"
            >
              caffeine.ai
            </a>
          </p>
          <p className="text-xs mt-2">© {new Date().getFullYear()} Photocard Binder</p>
          <button
            onClick={() => setShowTerms(true)}
            className="text-xs mt-1 text-binder-accent hover:underline"
          >
            Terms & Conditions
          </button>
          <p className="text-xs mt-1 opacity-50">Build: {BUILD_INFO.deploymentId}</p>
        </div>
      </footer>

      <TermsAndConditionsDialog open={showTerms} onOpenChange={setShowTerms} />
      <ProfileSettingsDialog open={showProfileSettings} onOpenChange={setShowProfileSettings} />
    </div>
  );
}
