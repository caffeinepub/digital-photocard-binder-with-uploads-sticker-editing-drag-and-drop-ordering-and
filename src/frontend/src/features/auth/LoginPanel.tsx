import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useAccentColor } from '../../hooks/useAccentColor';
import { Button } from '@/components/ui/button';
import { BookHeart } from 'lucide-react';

export default function LoginPanel() {
  const { login, loginStatus } = useInternetIdentity();
  
  // Initialize accent color for login screen
  useAccentColor();

  const isLoggingIn = loginStatus === 'logging-in';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-binder-dark via-binder-surface to-cream p-4">
      <div className="max-w-md w-full bg-binder-surface/90 backdrop-blur-sm rounded-2xl shadow-binder-lg p-8 border border-binder-border">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-binder-accent/20 rounded-2xl mb-4">
            <BookHeart className="w-10 h-10 text-binder-accent" />
          </div>
          <h1 className="text-4xl font-bold text-binder-text mb-2 font-display">
            Photocard Binder
          </h1>
          <p className="text-binder-text-muted">
            Your digital collection, beautifully organized
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={login}
            disabled={isLoggingIn}
            className="w-full h-12 text-lg bg-binder-accent hover:bg-binder-accent-hover text-white rounded-xl shadow-md"
          >
            {isLoggingIn ? 'Signing in...' : 'Sign in to start'}
          </Button>

          <p className="text-xs text-center text-binder-text-muted">
            Create and customize your photocard collections with stickers, themes, and more
          </p>
        </div>
      </div>
    </div>
  );
}
