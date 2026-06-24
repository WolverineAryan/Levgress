import { cn } from '../../utils/classnames';

export const ProgressBar = ({ value = 0, max = 100, className = '', segmented = false }) => {
  const percent = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  if (segmented) {
    // 5 segments (representing the 5 project milestones)
    const activeSegments = Math.round((percent / 100) * 5);
    return (
      <div className={cn("flex items-center gap-1.5 w-full", className)}>
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-2 flex-1 rounded-full transition-all duration-300",
              i < activeSegments
                ? "bg-accent-primary shadow-[0_0_8px_var(--color-accent-glow)]"
                : "bg-bg-elevated"
            )}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("w-full bg-bg-elevated h-2.5 rounded-full overflow-hidden relative", className)}>
      <div
        className="h-full bg-gradient-to-r from-accent-primary to-accent-hover rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_var(--color-accent-glow)]"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
};
