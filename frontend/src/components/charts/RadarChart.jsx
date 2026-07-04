import { ResponsiveContainer, RadarChart as RechartsRadar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

export const RadarChart = ({ data = [] }) => {
  // Format data for radar
  const tierValues = {
    UNVERIFIED: 20,
    BASIC: 50,
    INTERMEDIATE: 75,
    MASTER: 100,
  };

  const chartData = data.map((s) => ({
    subject: s.name,
    A: tierValues[s.tier] || 20,
    fullMark: 100,
  }));

  // Custom tick renderer to wrap long names into multiline tspans
  const renderCustomTick = ({ payload, x, y, textAnchor, ...rest }) => {
    const value = payload.value;
    const maxLen = 14;

    if (value.length > maxLen && value.includes(' ')) {
      const words = value.split(' ');
      const half = Math.ceil(words.length / 2);
      const line1 = words.slice(0, half).join(' ');
      const line2 = words.slice(half).join(' ');

      return (
        <text
          x={x}
          y={y}
          textAnchor={textAnchor}
          fontSize={10}
          fill="#a6998c"
          fontWeight="500"
          className="recharts-text recharts-polar-angle-axis-tick-value"
        >
          <tspan x={x} dy="-2">{line1}</tspan>
          <tspan x={x} dy="12">{line2}</tspan>
        </text>
      );
    }

    return (
      <text
        x={x}
        y={y}
        textAnchor={textAnchor}
        fontSize={10}
        fill="#a6998c"
        fontWeight="500"
        className="recharts-text recharts-polar-angle-axis-tick-value"
      >
        {value}
      </text>
    );
  };

  return (
    <div className="w-full h-80 flex items-center justify-center">
      {chartData.length === 0 ? (
        <div className="text-text-muted text-sm border border-dashed border-border-subtle p-8 rounded-xl w-full text-center">
          Add skills to display your radar
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <RechartsRadar cx="50%" cy="50%" outerRadius="55%" data={chartData}>
            <PolarGrid stroke="rgba(255,255,255,0.05)" />
            <PolarAngleAxis dataKey="subject" tick={renderCustomTick} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              name="Skill Level"
              dataKey="A"
              stroke="#c08552"
              fill="#c08552"
              fillOpacity={0.25}
            />
          </RechartsRadar>
        </ResponsiveContainer>
      )}
    </div>
  );
};
