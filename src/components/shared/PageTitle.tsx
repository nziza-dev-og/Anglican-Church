import type { ReactNode } from 'react';

interface PageTitleProps {
  title: string;
  subtitle?: string | ReactNode;
  actions?: ReactNode;
  className?: string;
}

export default function PageTitle({ title, subtitle, actions, className }: PageTitleProps) {
  return (
    <div className={`mb-8 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary tracking-tight sm:text-4xl animate-fade-in">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-lg text-muted-foreground animate-slide-in-up animation-delay-200">
              {subtitle}
            </p>
          )}
        </div>
        {actions && <div className="shrink-0 animate-fade-in animation-delay-400">{actions}</div>}
      </div>
    </div>
  );
}

// Helper for CSS animation delays
// Add to globals.css or tailwind.config.js if used extensively
// For now, inline style or specific class is fine
// .animation-delay-200 { animation-delay: 0.2s; }
// .animation-delay-400 { animation-delay: 0.4s; }
// These can be added to globals.css if needed.
// For simplicity, assuming tailwind JIT can pick up arbitrary values or manual setup.
// The keyframes are in tailwind.config.ts