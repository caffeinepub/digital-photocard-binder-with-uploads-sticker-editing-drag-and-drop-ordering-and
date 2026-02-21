import { useState } from 'react';
import { useSaveCallerUserProfile } from '../../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles } from 'lucide-react';

export default function ProfileSetupModal() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const { mutate: saveProfile, isPending } = useSaveCallerUserProfile();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      saveProfile({
        name: name.trim(),
        displayName: name.trim(),
        email: email.trim() || undefined,
        avatarUrl: undefined,
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream via-peach to-sage p-4">
      <div className="max-w-md w-full bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border-4 border-coral/20">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-coral/10 rounded-full mb-4">
            <Sparkles className="w-8 h-8 text-coral" />
          </div>
          <h2 className="text-3xl font-bold text-charcoal mb-2 font-handwriting">
            Welcome!
          </h2>
          <p className="text-muted-foreground">
            Let's personalize your binder
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-charcoal font-medium">
              What should we call you?
            </Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="h-12 rounded-xl border-2 border-sage/30 focus:border-coral"
              autoFocus
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-charcoal font-medium">
              Email (optional)
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="h-12 rounded-xl border-2 border-sage/30 focus:border-coral"
            />
          </div>

          <Button
            type="submit"
            disabled={!name.trim() || isPending}
            className="w-full h-12 text-lg bg-coral hover:bg-coral-dark text-white rounded-2xl shadow-md"
          >
            {isPending ? 'Setting up...' : 'Continue'}
          </Button>
        </form>
      </div>
    </div>
  );
}
