import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { BookHeart, LogOut, Heart } from 'lucide-react';
import { ReactNode } from 'react';

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
    <div className="min-h-screen bg-cream">
      <header className="bg-white/80 backdrop-blur-sm border-b-4 border-coral/20 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onNavigateHome}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="w-10 h-10 bg-coral/10 rounded-full flex items-center justify-center">
                <BookHeart className="w-6 h-6 text-coral" />
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-bold text-charcoal font-handwriting">
                  Photocard Binder
                </h1>
              </div>
            </button>

            <div className="flex items-center gap-4">
              {userProfile && (
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  {userProfile.displayName || userProfile.name}
                </span>
              )}
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="rounded-full border-2 border-sage/30 hover:border-coral hover:bg-coral/5"
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

      <footer className="bg-white/60 backdrop-blur-sm border-t-4 border-coral/20 mt-16 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p className="flex items-center justify-center gap-2">
            Built with <Heart className="w-4 h-4 text-coral fill-coral" /> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-coral hover:underline font-medium"
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
