import { cn } from '../../utils/classnames';

export const LevelRing = ({ level = 1, xp = 0, xpNeeded = 100, size = 120, className = '' }) => {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const percent = level >= 100 ? 100 : Math.min(100, Math.max(0, (xp / xpNeeded) * 100));
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div
      className={cn("relative flex items-center justify-center select-none", className)}
      style={{ width: size, height: size }}
    >
      {/* Outer SVG Ring */}
      <svg className="w-full h-full transform -rotate-90">
        {/* Track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="stroke-bg-elevated fill-none"
          strokeWidth="6"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="stroke-accent-primary fill-none transition-all duration-500 ease-out"
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>

      {/* Inside Text Info */}
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-3xl font-black tracking-tight text-text-primary">{level}</span>
        <span className="text-[10px] uppercase font-bold text-accent-primary tracking-wider">LEVEL</span>
      </div>
    </div>
  );
};
