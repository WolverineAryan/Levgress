import { forwardRef } from 'react';
import { cn } from '../../utils/classnames';

export const Input = forwardRef(({
  label,
  error,
  type = 'text',
  className = '',
  ...props
}, ref) => {
  return (
    <div className="flex flex-col space-y-1.5 w-full">
      {label && (
        <label className="text-xs font-medium text-text-secondary">
          {label}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        className={cn(
          'w-full px-4 py-2 text-sm bg-bg-secondary border border-border-subtle rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary transition-all duration-200',
          error && 'border-status-danger focus:border-status-danger',
          className
        )}
        {...props}
      />
      {error && (
        <span className="text-xs text-status-danger mt-1">
          {error}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';
