import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as studentsApi from '../api/students';
import { Card, CardHeader, CardTitle, CardContent, Input } from '../components/ui';
import { Trophy, Search, Star, Flame } from 'lucide-react';
import { cn } from '../utils/classnames';

export const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await studentsApi.getLeaderboard();
        setLeaderboard(res.data.data.leaderboard);
      } catch (err) {
        setError('Failed to fetch rankings');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col space-y-4 animate-pulse">
        <div className="h-10 bg-bg-card w-1/4 rounded"></div>
        <div className="h-96 bg-bg-card rounded-2xl"></div>
      </div>
    );
  }

  // Filter list
  const filteredRankings = leaderboard.filter((student) =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const topThree = leaderboard.slice(0, 3);
  const remainder = filteredRankings.slice(3);

  // Podium mappings
  const podiumOrder = [
    topThree[1], // 2nd on Left
    topThree[0], // 1st in Center
    topThree[2], // 3rd on Right
  ].filter(Boolean);

  return (
    <div className="flex flex-col space-y-8 select-none">
      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <Trophy className="text-accent-primary" /> Global Leaderboard
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          Rankings are calculated dynamically based on total lifetime cumulative experience points.
        </p>
      </div>

      {/* Podium display (Top 3) */}
      {topThree.length > 0 && (
        <div className="flex items-end justify-center gap-4 sm:gap-8 pt-8 max-w-xl mx-auto w-full">
          {podiumOrder.map((student) => {
            const isFirst = student.rank === 1;
            const isSecond = student.rank === 2;
            const isThird = student.rank === 3;

            return (
              <div
                key={student.studentId}
                className={cn(
                  "flex flex-col items-center relative",
                  isFirst && "z-10 -translate-y-4"
                )}
              >
                <Link to={`/profile/${student.studentId}`} className="flex flex-col items-center hover:opacity-85 transition-opacity">
                  {/* Avatar bubble */}
                  <div className={cn(
                    "relative p-1 rounded-full border mb-2",
                    isFirst && "border-accent-primary bg-accent-primary/10 shadow-[0_0_15px_var(--color-accent-glow)] animate-float",
                    isSecond && "border-neutral-400 bg-neutral-400/5",
                    isThird && "border-amber-750 bg-amber-750/5"
                  )}>
                    <div className={cn(
                      "w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center font-black text-lg bg-bg-card text-text-primary border border-border-subtle overflow-hidden"
                    )}>
                      {student.avatar ? (
                        <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                      ) : (
                        student.name.charAt(0)
                      )}
                    </div>
                    {/* Rank badge */}
                    <div className={cn(
                      "absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] text-bg-primary border border-bg-card",
                      isFirst && "bg-accent-primary",
                      isSecond && "bg-neutral-400",
                      isThird && "bg-[#d4af37]"
                    )}>
                      {student.rank}
                    </div>
                  </div>

                  <span className="text-xs font-bold text-text-primary truncate max-w-[80px] sm:max-w-[100px] text-center">
                    {student.name}
                  </span>
                </Link>

                <span className="text-[10px] text-text-muted font-semibold mt-0.5">
                  Lvl {student.level}
                </span>

                {/* Pedestal block */}
                <div className={cn(
                  "w-16 sm:w-20 bg-bg-card border-x border-t border-border-subtle rounded-t-lg mt-3 flex flex-col items-center justify-center p-2",
                  isFirst && "h-24 border-accent-primary/20",
                  isSecond && "h-16",
                  isThird && "h-12"
                )}>
                  <span className="text-[10px] font-black text-text-primary">{student.cumulativeXP}</span>
                  <span className="text-[8px] font-bold text-accent-primary tracking-wider uppercase">XP</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Main Ranking Table list */}
      <Card className="p-6">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <CardTitle>Global Rankings</CardTitle>
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search student rankings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-bg-secondary border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent-primary"
            />
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-text-muted" />
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border-subtle text-text-muted uppercase font-bold text-[10px] tracking-wider">
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Level</th>
                <th className="py-3 px-4">Active Streak</th>
                <th className="py-3 px-4 text-right">Cumulative XP</th>
              </tr>
            </thead>
            <tbody>
              {filteredRankings.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-text-muted">
                    No rankings matched query
                  </td>
                </tr>
              ) : (
                filteredRankings.map((student) => (
                  <tr
                    key={student.studentId}
                    className={cn(
                      "border-b border-border-subtle hover:bg-bg-elevated/20 transition-colors",
                      student.rank === 1 && "bg-accent-primary/[0.01]"
                    )}
                  >
                    <td className="py-4 px-4 font-bold text-text-primary">{student.rank}</td>
                    <td className="py-4 px-4 font-semibold text-text-primary">
                      <Link to={`/profile/${student.studentId}`} className="flex items-center gap-3 hover:text-accent-primary transition-colors">
                        <div className="w-7 h-7 rounded-full bg-bg-secondary border border-border-subtle flex items-center justify-center font-bold text-[10px] overflow-hidden">
                          {student.avatar ? (
                            <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                          ) : (
                            student.name.charAt(0)
                          )}
                        </div>
                        {student.name}
                      </Link>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 font-semibold text-text-secondary">
                        <Star className="w-3.5 h-3.5 text-accent-primary fill-accent-primary/10" /> {student.level}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {student.streak > 0 ? (
                        <span className="inline-flex items-center gap-1 text-status-warning font-semibold">
                          <Flame className="w-3.5 h-3.5 fill-status-warning/10" /> {student.streak} days
                        </span>
                      ) : (
                        <span className="text-text-muted">-</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right font-black text-text-primary">{student.cumulativeXP} XP</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
