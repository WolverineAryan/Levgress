import { cn } from '../../utils/classnames';

export const Card = ({ children, className = '', glow = false, ...props }) => {
  return (
    <div
      className={cn(
        'glass-card p-6 overflow-hidden relative',
        glow && 'border-border-primary/50 shadow-[0_0_20px_var(--color-accent-glow)]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={cn('flex flex-col space-y-1.5 mb-4', className)}>{children}</div>
);

export const CardTitle = ({ children, className = '' }) => (
  <h3 className={cn('font-semibold text-lg text-text-primary tracking-tight', className)}>{children}</h3>
);

export const CardDescription = ({ children, className = '' }) => (
  <p className={cn('text-xs text-text-secondary', className)}>{children}</p>
);

export const CardContent = ({ children, className = '' }) => (
  <div className={cn('', className)}>{children}</div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={cn('flex items-center mt-6 pt-4 border-t border-border-subtle', className)}>{children}</div>
);
