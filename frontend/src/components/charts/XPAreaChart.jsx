import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

export const XPAreaChart = ({ data = [] }) => {
  // Format data for chart
  const chartData = data.slice().reverse().map((log) => ({
    date: new Date(log.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    XP: log.activityType === 'LEVEL_UP' ? 100 : 50, // standard value for display
    name: log.details.substring(0, 15) + '...',
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-bg-card border border-border-primary p-3 rounded-lg shadow-xl text-xs">
          <p className="text-text-secondary">{payload[0].payload.date}</p>
          <p className="text-accent-primary font-bold">{payload[0].payload.name}</p>
          <p className="text-text-primary mt-1">XP Event: {payload[0].value} XP</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-64">
      {chartData.length === 0 ? (
        <div className="w-full h-full flex items-center justify-center text-text-muted text-sm border border-dashed border-border-subtle rounded-xl">
          No recent activity to chart
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#c08552" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#c08552" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              stroke="#6b5f54"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#6b5f54"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="XP"
              stroke="#c08552"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorXp)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
