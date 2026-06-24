import { cn } from '../../utils/classnames';

export const Badge = ({ children, className = '', variant = 'neutral', pulse = false }) => {
  const variants = {
    neutral: 'bg-bg-elevated text-text-secondary border-neutral-700',
    primary: 'bg-accent-primary/10 text-accent-primary border-accent-primary/20',
    success: 'bg-status-success/10 text-status-success border-status-success/20',
    warning: 'bg-status-warning/10 text-status-warning border-status-warning/20',
    danger: 'bg-status-danger/10 text-status-danger border-status-danger/20',
    info: 'bg-status-info/10 text-status-info border-status-info/20',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border',
        variants[variant],
        className
      )}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className={cn(
            "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
            variant === 'success' && 'bg-status-success',
            variant === 'warning' && 'bg-status-warning',
            variant === 'danger' && 'bg-status-danger',
            variant === 'info' && 'bg-status-info',
            variant === 'primary' && 'bg-accent-primary'
          )}></span>
          <span className={cn(
            "relative inline-flex rounded-full h-2 w-2",
            variant === 'success' && 'bg-status-success',
            variant === 'warning' && 'bg-status-warning',
            variant === 'danger' && 'bg-status-danger',
            variant === 'info' && 'bg-status-info',
            variant === 'primary' && 'bg-accent-primary'
          )}></span>
        </span>
      )}
      {children}
    </span>
  );
};
