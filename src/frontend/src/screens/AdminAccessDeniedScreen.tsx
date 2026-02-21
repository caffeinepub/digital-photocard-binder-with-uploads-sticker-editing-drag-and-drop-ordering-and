import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AdminAccessDeniedScreenProps {
  onBack: () => void;
}

export default function AdminAccessDeniedScreen({ onBack }: AdminAccessDeniedScreenProps) {
  return (
    <div className="max-w-2xl mx-auto text-center py-16">
      <div className="bg-binder-surface rounded-2xl p-12 border-2 border-binder-border shadow-binder-lg">
        <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-10 h-10 text-destructive" />
        </div>
        
        <h1 className="text-3xl font-bold text-binder-text font-display mb-4">
          Access Denied
        </h1>
        
        <p className="text-binder-text-muted text-lg mb-8">
          You do not have access to the Admin Dashboard.
        </p>
        
        <Button
          onClick={onBack}
          className="bg-binder-accent hover:bg-binder-accent-hover text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Library
        </Button>
      </div>
    </div>
  );
}
