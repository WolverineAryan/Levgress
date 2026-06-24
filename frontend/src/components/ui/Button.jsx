import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/classnames';

export const Button = ({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 cursor-pointer focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';
  
  const variants = {
    primary: 'bg-accent-primary hover:bg-accent-hover text-bg-primary shadow-sm hover:shadow-[0_0_15px_var(--color-accent-glow)]',
    secondary: 'bg-bg-elevated hover:bg-neutral-800 text-text-primary border border-border-subtle hover:border-border-primary',
    danger: 'bg-status-danger/10 hover:bg-status-danger/20 text-status-danger border border-status-danger/20',
    success: 'bg-status-success/10 hover:bg-status-success/20 text-status-success border border-status-success/20',
    ghost: 'bg-transparent hover:bg-white/5 text-text-secondary hover:text-text-primary',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : Icon && iconPosition === 'left' ? (
        <Icon className="w-4 h-4 mr-2" />
      ) : null}
      
      {children}
      
      {!loading && Icon && iconPosition === 'right' ? (
        <Icon className="w-4 h-4 ml-2" />
      ) : null}
    </button>
  );
};
