import { useState, useEffect } from 'react';
import * as studentsApi from '../api/students';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui';
import { Brain, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, Lightbulb } from 'lucide-react';
import { cn } from '../utils/classnames';

export const AIInsights = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const res = await studentsApi.getAIInsights();
        setData(res.data.data);
      } catch (err) {
        setError('Failed to fetch AI insights analysis');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col space-y-4 animate-pulse">
        <div className="h-10 bg-bg-card w-1/4 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <div key={i} className="h-48 bg-bg-card rounded-2xl"></div>)}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-status-danger/10 border border-status-danger/25 text-status-danger rounded-xl text-center">
        {error || 'AI insights not available.'}
      </div>
    );
  }

  const { insightsAvailable, averageScore, milestonesAnalyzedCount, strengths = [], weaknesses = [], recommendations = [], message } = data;

  if (!insightsAvailable) {
    return (
      <div className="flex flex-col space-y-8 select-none">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Brain className="text-accent-primary" /> AI Insights Advisor
          </h1>
          <p className="text-xs text-text-secondary mt-1">Get custom reviews based on your milestones evidence.</p>
        </div>
        <Card className="p-12 text-center border-dashed flex flex-col items-center">
          <Sparkles className="w-12 h-12 text-text-muted mb-4 animate-float" />
          <CardTitle>Advisor Stalled</CardTitle>
          <CardDescription className="max-w-xs mt-2 text-center">
            {message}
          </CardDescription>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-8 select-none">
      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <Brain className="text-accent-primary" /> AI Insights Advisor
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          Analyzed from your last {milestonesAnalyzedCount} milestones submissions.
        </p>
      </div>

      {/* Aggregate Score Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 p-6 flex flex-col justify-between border-t-2 border-t-accent-primary">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-accent-primary tracking-widest uppercase">Metrics</span>
            <CardTitle className="mt-2 text-sm">Average Approval Score</CardTitle>
          </div>
          <div className="my-6 flex items-baseline gap-1">
            <span className="text-5xl font-black text-text-primary">{averageScore}</span>
            <span className="text-text-muted text-xs">/100</span>
          </div>
          <p className="text-[10px] text-text-secondary leading-relaxed">
            AI validation requires a minimum threshold of 80 points to verify a milestone.
          </p>
        </Card>

        {/* Strengths & Weaknesses Split card */}
        <Card className="md:col-span-2 p-6 flex flex-col space-y-6">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent-primary" /> Analysis breakdown
          </CardTitle>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="flex flex-col space-y-3">
              <span className="text-[10px] font-black text-status-success tracking-widest uppercase flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Strengths
              </span>
              <ul className="flex flex-col space-y-2.5">
                {strengths.map((str, idx) => (
                  <li key={idx} className="text-xs text-text-secondary leading-relaxed list-disc list-inside">
                    {str}
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="flex flex-col space-y-3">
              <span className="text-[10px] font-black text-status-warning tracking-widest uppercase flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> Improvement Areas
              </span>
              <ul className="flex flex-col space-y-2.5">
                {weaknesses.map((weak, idx) => (
                  <li key={idx} className="text-xs text-text-secondary leading-relaxed list-disc list-inside">
                    {weak}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      </div>

      {/* Recommendations Feed */}
      <div className="flex flex-col space-y-4">
        <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-accent-primary" /> Custom Mentorship Actions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendations.map((rec, idx) => (
            <Card key={idx} className="p-6 border-l-2 border-l-accent-primary flex items-start gap-4 bg-accent-primary/[0.01]">
              <div className="p-2 bg-accent-primary/10 text-accent-primary rounded-xl mt-0.5">
                <ArrowRight className="w-4 h-4" />
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-[10px] font-bold text-text-muted">ACTION {idx + 1}</span>
                <p className="text-xs text-text-primary leading-relaxed mt-1 font-semibold">{rec}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
