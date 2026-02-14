import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { BookHeart, LogOut, Heart } from 'lucide-react';
import { ReactNode } from 'react';
import AccentColorSelector from './AccentColorSelector';

interface AppLayoutProps {
  children: ReactNode;
  onNavigateHome: () => void;
}

export default function AppLayout({ children, onNavigateHome }: AppLayoutProps) {
  const { clear } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const queryClient = useQueryClient();

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
              {userProfile && (
                <span className="text-sm text-binder-text-muted hidden sm:inline">
                  {userProfile.displayName || userProfile.name}
                </span>
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
        </div>
      </footer>
    </div>
  );
}
