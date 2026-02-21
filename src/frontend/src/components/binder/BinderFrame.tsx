import { ReactNode } from 'react';
import { useGetAdminContentSettings } from '../../hooks/useQueries';

interface BinderFrameProps {
  children: ReactNode;
  theme?: {
    pageBackground?: string;
    accentColor?: string;
    backgroundPattern?: string;
  };
}

export default function BinderFrame({ children, theme }: BinderFrameProps) {
  const { data: appSettings } = useGetAdminContentSettings();

  // Use custom background if set by admin, otherwise fall back to theme or default
  const backgroundImage = appSettings?.background
    ? appSettings.background.getDirectURL()
    : theme?.backgroundPattern || '/assets/generated/binder-page-light-texture.dim_2048x2048.png';

  return (
    <div className="relative">
      {/* Binder spine/edge */}
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-binder-border/20 to-transparent z-10 pointer-events-none">
        <div className="absolute left-2 top-0 bottom-0 w-1 bg-binder-border/40" />
        <div className="absolute left-4 top-0 bottom-0 w-px bg-binder-border/30" />
      </div>

      {/* Main binder page */}
      <div
        className="rounded-2xl p-8 min-h-[600px] border-2 border-binder-border shadow-binder-lg relative overflow-hidden"
        style={{
          backgroundColor: theme?.pageBackground || 'oklch(0.96 0.02 58)',
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundBlendMode: 'overlay',
        }}
      >
        {/* Page texture overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent pointer-events-none" />
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
}
