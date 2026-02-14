import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { BookHeart } from 'lucide-react';

export default function LoginPanel() {
  const { login, loginStatus } = useInternetIdentity();

  const isLoggingIn = loginStatus === 'logging-in';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream via-peach to-sage p-4">
      <div className="max-w-md w-full bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border-4 border-coral/20">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-coral/10 rounded-full mb-4">
            <BookHeart className="w-10 h-10 text-coral" />
          </div>
          <h1 className="text-4xl font-bold text-charcoal mb-2 font-handwriting">
            Photocard Binder
          </h1>
          <p className="text-muted-foreground">
            Your digital collection, beautifully organized
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={login}
            disabled={isLoggingIn}
            className="w-full h-12 text-lg bg-coral hover:bg-coral-dark text-white rounded-2xl shadow-md"
          >
            {isLoggingIn ? 'Signing in...' : 'Sign in to start'}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Create and customize your photocard collections with stickers, themes, and more
          </p>
        </div>
      </div>
    </div>
  );
}
