import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

export const StatusPieChart = ({ data = [] }) => {
  // Count by status
  const counts = {
    PLANNING: 0,
    IN_PROGRESS: 0,
    COMPLETED: 0,
  };

  data.forEach((p) => {
    if (counts[p.status] !== undefined) {
      counts[p.status]++;
    }
  });

  const chartData = [
    { name: 'Planning', value: counts.PLANNING, color: '#fbbf24' },
    { name: 'In Progress', value: counts.IN_PROGRESS, color: '#60a5fa' },
    { name: 'Completed', value: counts.COMPLETED, color: '#4ade80' },
  ].filter((item) => item.value > 0);

  return (
    <div className="w-full h-48 flex items-center justify-center">
      {chartData.length === 0 ? (
        <div className="text-text-muted text-sm">No project metrics</div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              innerRadius={50}
              outerRadius={70}
              paddingAngle={4}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#1c1815',
                borderColor: 'rgba(255,255,255,0.05)',
                borderRadius: '8px',
                color: '#f4efe9',
                fontSize: '11px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
