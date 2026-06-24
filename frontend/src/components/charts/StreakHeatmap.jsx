import { cn } from '../../utils/classnames';

export const StreakHeatmap = ({ activityLogs = [] }) => {
  // Create array of the last 28 days
  const getDaysArray = () => {
    const days = [];
    const today = new Date();
    
    // Map dates to active state
    const activeDates = new Set(
      activityLogs.map((log) => new Date(log.createdAt).toDateString())
    );

    for (let i = 27; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      days.push({
        dateString: date.toDateString(),
        dayOfMonth: date.getDate(),
        isActive: activeDates.has(date.toDateString()),
      });
    }
    return days;
  };

  const days = getDaysArray();

  return (
    <div className="flex flex-col space-y-2">
      <div className="grid grid-cols-7 gap-1.5 max-w-[210px]">
        {days.map((day, idx) => (
          <div
            key={idx}
            className={cn(
              "w-6 h-6 rounded flex items-center justify-center text-[10px] font-semibold transition-all duration-300 relative group cursor-pointer border border-transparent",
              day.isActive
                ? "bg-accent-primary text-bg-primary shadow-[0_0_8px_var(--color-accent-glow)] font-bold"
                : "bg-bg-elevated text-text-muted hover:border-border-primary"
            )}
            title={day.dateString}
          >
            {day.dayOfMonth}
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1.5 px-2 py-1 bg-bg-card border border-border-primary rounded text-[9px] text-text-primary whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-10">
              {day.dateString}: {day.isActive ? 'Active' : 'No activity'}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center max-w-[210px] text-[10px] text-text-muted">
        <span>28 days ago</span>
        <span>Today</span>
      </div>
    </div>
  );
};
