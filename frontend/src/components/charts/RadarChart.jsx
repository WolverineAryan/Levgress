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

  return (
    <div className="w-full h-64 flex items-center justify-center">
      {chartData.length === 0 ? (
        <div className="text-text-muted text-sm border border-dashed border-border-subtle p-8 rounded-xl w-full text-center">
          Add skills to display your radar
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <RechartsRadar cx="50%" cy="50%" outerRadius="70%" data={chartData}>
            <PolarGrid stroke="rgba(255,255,255,0.05)" />
            <PolarAngleAxis dataKey="subject" stroke="#a6998c" fontSize={11} />
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
