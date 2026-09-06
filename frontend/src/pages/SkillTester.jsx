import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import * as studentsApi from '../api/students';
import { Card, CardHeader, CardTitle, CardContent, Button } from '../components/ui';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  BrainCircuit, 
  Check, 
  X, 
  Award, 
  AlertTriangle, 
  ArrowRight, 
  Cpu, 
  BookOpen, 
  Layout, 
  Server, 
  Database,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

const CATEGORY_ICONS = {
  Frontend: Layout,
  Backend: Server,
  Database: Database,
  DevOps: Cpu,
};

const getTierBadgeStyles = (tier) => {
  switch (tier) {
    case 'BASIC':
      return 'border-status-success/30 text-status-success bg-status-success/5';
    case 'INTERMEDIATE':
      return 'border-accent-primary/30 text-accent-primary bg-accent-primary/5';
    case 'MASTER':
      return 'border-status-warning/40 text-status-warning bg-status-warning/5';
    case 'UNVERIFIED':
    default:
      return 'border-border-subtle text-text-muted bg-bg-card';
  }
};

export const SkillTester = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Dashboard state
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Active quiz state
  const [activeQuiz, setActiveQuiz] = useState(null);
  // activeQuiz schema: {
  //   skillName: string,
  //   tier: 'BASIC' | 'INTERMEDIATE' | 'MASTER',
  //   questions: Array<{ question: string, options: string[], answerIndex: number }>,
  //   currentIdx: number,
  //   selectedAnswer: number | null,
  //   answers: number[], // user's choices
  //   status: 'generating' | 'active' | 'success' | 'failure' | 'submitting',
  //   score: number,
  //   xpReward: number
  // }

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await studentsApi.getMySkills();
        setSkills(res.data.data.skills);

        // Check query parameters to auto-start quiz
        const paramSkill = searchParams.get('skill');
        const paramTier = searchParams.get('tier');
        if (paramSkill && paramTier) {
          startQuiz(paramSkill, paramTier);
        }
      } catch (err) {
        setError('Failed to load skills inventory');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSkills();
  }, [searchParams]);

  const startQuiz = async (skillName, tier) => {
    setActiveQuiz({
      skillName,
      tier,
      questions: [],
      currentIdx: 0,
      selectedAnswer: null,
      answers: [],
      status: 'generating',
      score: 0,
      xpReward: 0,
    });
    setError('');

    try {
      const res = await studentsApi.generateSkillQuestions(skillName, tier);
      const generatedQuestions = res.data.data.questions;

      if (!generatedQuestions || generatedQuestions.length === 0) {
        throw new Error('No questions returned by AI Mentor');
      }

      setActiveQuiz((prev) => ({
        ...prev,
        questions: generatedQuestions,
        status: 'active',
      }));
    } catch (err) {
      console.error(err);
      setError('Failed to generate quiz. Please try again.');
      setActiveQuiz(null);
      // Clean query params
      setSearchParams({});
    }
  };

  const handleSelectOption = (idx) => {
    if (activeQuiz.status !== 'active') return;
    setActiveQuiz((prev) => ({
      ...prev,
      selectedAnswer: idx,
    }));
  };

  const handleNextQuestion = () => {
    if (activeQuiz.selectedAnswer === null) return;

    const isLast = activeQuiz.currentIdx === activeQuiz.questions.length - 1;
    const newAnswers = [...activeQuiz.answers, activeQuiz.selectedAnswer];

    if (isLast) {
      submitQuizResults(newAnswers);
    } else {
      setActiveQuiz((prev) => ({
        ...prev,
        currentIdx: prev.currentIdx + 1,
        selectedAnswer: null,
        answers: newAnswers,
      }));
    }
  };

  const submitQuizResults = async (finalAnswers) => {
    setActiveQuiz((prev) => ({
      ...prev,
      status: 'submitting',
      answers: finalAnswers,
    }));

    // Calculate score for 10 questions
    let score = 0;
    activeQuiz.questions.forEach((q, idx) => {
      if (q.answerIndex === finalAnswers[idx]) {
        score++;
      }
    });

    const passed = score >= 7;

    try {
      const res = await studentsApi.submitSkillTest(
        activeQuiz.skillName,
        activeQuiz.tier,
        passed
      );

      if (passed) {
        setActiveQuiz((prev) => ({
          ...prev,
          status: 'success',
          score,
          xpReward: res.data.data.xpReward || (activeQuiz.tier === 'MASTER' ? 500 : activeQuiz.tier === 'INTERMEDIATE' ? 300 : 150),
        }));
      } else {
        setActiveQuiz((prev) => ({
          ...prev,
          status: 'failure',
          score,
        }));
      }
    } catch (err) {
      console.error(err);
      setError('Failed to save quiz results to backend.');
      setActiveQuiz((prev) => ({
        ...prev,
        status: 'failure',
        score,
      }));
    }
  };

  const quitQuiz = () => {
    setActiveQuiz(null);
    setSearchParams({});
  };

  // Render Loader screen
  if (loading) {
    return (
      <div className="flex flex-col space-y-4 animate-pulse p-6">
        <div className="h-10 bg-bg-card w-1/4 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-40 bg-bg-card rounded-2xl"></div>
          <div className="h-40 bg-bg-card rounded-2xl"></div>
        </div>
      </div>
    );
  }

  // Render Immersive Quiz Screen
  if (activeQuiz) {
    const { skillName, tier, questions, currentIdx, selectedAnswer, answers, status, score, xpReward } = activeQuiz;

    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 select-none relative">
        <div className="absolute inset-0 bg-accent-primary/5 blur-[120px] pointer-events-none rounded-full w-96 h-96 mx-auto my-auto" />
        
        <div className="w-full max-w-2xl bg-bg-secondary border border-border-primary rounded-2xl p-8 backdrop-blur-md shadow-2xl relative z-10">
          <AnimatePresence mode="wait">
            {status === 'generating' && (
              <motion.div
                key="generating"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center py-12 text-center space-y-6"
              >
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center animate-pulse">
                    <BrainCircuit className="w-10 h-10 text-accent-primary" />
                  </div>
                  <motion.div
                    className="absolute -top-1 -right-1 text-status-warning"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
                  >
                    <Sparkles className="w-5 h-5" />
                  </motion.div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-lg font-extrabold text-text-primary animate-pulse">Tailoring 10 custom questions...</h3>
                  <p className="text-xs text-text-secondary max-w-sm">
                    AI Mentor is generating 10 multiple-choice challenges for <span className="text-accent-primary font-semibold">{skillName}</span> at the <span className="text-text-primary font-bold">{tier}</span> tier.
                  </p>
                </div>
              </motion.div>
            )}

            {status === 'active' && questions.length > 0 && (
              <motion.div
                key="active"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Header */}
                <div className="flex justify-between items-center pb-4 border-b border-border-subtle">
                  <div>
                    <h3 className="text-sm font-bold text-text-primary">{skillName} Quiz</h3>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border mt-1 inline-block ${getTierBadgeStyles(tier)}`}>
                      {tier}
                    </span>
                  </div>
                  <button 
                    onClick={quitQuiz} 
                    className="text-[10px] font-semibold text-text-muted hover:text-status-danger transition-colors bg-transparent border-0 cursor-pointer"
                  >
                    Quit Test
                  </button>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] text-text-muted">
                    <span>Question {currentIdx + 1} of {questions.length}</span>
                    <span>{Math.round(((currentIdx + 1) / questions.length) * 100)}% Complete</span>
                  </div>
                  <div className="w-full bg-bg-elevated h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-accent-primary transition-all duration-300"
                      style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Question */}
                <div className="py-4">
                  <h4 className="text-sm font-bold leading-relaxed text-text-primary">
                    {questions[currentIdx].question}
                  </h4>
                </div>

                {/* Options List */}
                <div className="space-y-2.5">
                  {questions[currentIdx].options.map((opt, optIdx) => {
                    const isSelected = selectedAnswer === optIdx;
                    return (
                      <div
                        key={optIdx}
                        onClick={() => handleSelectOption(optIdx)}
                        className={`p-3.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-accent-primary/10 border-accent-primary text-accent-primary shadow-sm'
                            : 'bg-bg-elevated/40 border-border-subtle text-text-secondary hover:border-border-primary hover:text-text-primary'
                        }`}
                      >
                        <span>{opt}</span>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                          isSelected ? 'border-accent-primary bg-accent-primary text-bg-primary' : 'border-border-subtle'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Next Button */}
                <div className="flex justify-end pt-4 border-t border-border-subtle">
                  <Button
                    onClick={handleNextQuestion}
                    disabled={selectedAnswer === null}
                    className="text-xs px-6 py-2.5 flex items-center gap-2"
                  >
                    <span>{currentIdx === questions.length - 1 ? 'Submit Test' : 'Next Question'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {status === 'submitting' && (
              <motion.div
                key="submitting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-12 text-center space-y-6"
              >
                <div className="w-12 h-12 rounded-full border-2 border-accent-primary/20 border-t-accent-primary animate-spin" />
                <h3 className="text-sm font-bold text-text-primary animate-pulse">Grading 10 responses...</h3>
              </motion.div>
            )}

            {(status === 'success' || status === 'failure') && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col space-y-6"
              >
                {/* Result Banner */}
                <div className="flex flex-col items-center text-center space-y-4 py-4 border-b border-border-subtle">
                  <div className={`w-16 h-16 rounded-full border flex items-center justify-center ${
                    status === 'success'
                      ? 'bg-status-success/10 border-status-success/20 text-status-success'
                      : 'bg-status-danger/10 border-status-danger/20 text-status-danger'
                  }`}>
                    {status === 'success' ? <Award className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-text-primary">
                      {status === 'success' ? 'Tier Unlocked!' : 'Test Not Passed'}
                    </h3>
                    <p className="text-xs text-text-secondary mt-1">
                      You scored <span className={`font-extrabold ${status === 'success' ? 'text-status-success' : 'text-status-danger'}`}>{score}/10</span> on the <span className="font-bold">{skillName}</span> {tier} test.
                      {status === 'success' ? ` (+${xpReward} XP)` : ' (Passing score: 7/10)'}
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button variant="ghost" onClick={quitQuiz} className="text-xs px-5 py-2 cursor-pointer">
                      Close
                    </Button>
                    <Button onClick={() => startQuiz(skillName, tier)} className="text-xs px-6 py-2 cursor-pointer">
                      Retry Test
                    </Button>
                  </div>
                </div>

                {/* Comprehensive Question & Explanation Review Section */}
                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1 scrollbar-thin">
                  <h4 className="text-xs font-extrabold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-accent-primary" /> Question Review & Explanations
                  </h4>

                  {questions.map((q, qIdx) => {
                    const userPick = answers[qIdx];
                    const isCorrect = userPick === q.answerIndex;

                    return (
                      <div key={qIdx} className={`p-4 rounded-xl border text-xs space-y-2.5 ${
                        isCorrect ? 'bg-status-success/5 border-status-success/20' : 'bg-status-danger/5 border-status-danger/20'
                      }`}>
                        <div className="flex justify-between items-start gap-2">
                          <span className="font-bold text-text-primary">
                            Q{qIdx + 1}. {q.question}
                          </span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded shrink-0 ${
                            isCorrect ? 'bg-status-success/20 text-status-success' : 'bg-status-danger/20 text-status-danger'
                          }`}>
                            {isCorrect ? '✓ Correct' : '✕ Incorrect'}
                          </span>
                        </div>

                        <div className="space-y-1 pl-2">
                          {q.options.map((opt, optIdx) => {
                            const isUserSelected = userPick === optIdx;
                            const isAnswer = q.answerIndex === optIdx;

                            return (
                              <div key={optIdx} className={`p-2 rounded text-[11px] flex items-center justify-between ${
                                isAnswer
                                  ? 'bg-status-success/15 text-status-success font-bold border border-status-success/30'
                                  : isUserSelected
                                    ? 'bg-status-danger/15 text-status-danger font-bold border border-status-danger/30'
                                    : 'text-text-secondary'
                              }`}>
                                <span>{opt}</span>
                                {isAnswer && <Check className="w-3.5 h-3.5 text-status-success" />}
                                {isUserSelected && !isAnswer && <X className="w-3.5 h-3.5 text-status-danger" />}
                              </div>
                            );
                          })}
                        </div>

                        {/* Short Explanation Box */}
                        {q.explanation && (
                          <div className="p-2.5 rounded bg-bg-elevated/70 border border-border-subtle text-[11px] text-text-secondary leading-relaxed">
                            <strong className="text-accent-primary">Explanation:</strong> {q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // Render Dashboard View
  const nextTierMap = {
    UNVERIFIED: 'BASIC',
    BASIC: 'INTERMEDIATE',
    INTERMEDIATE: 'MASTER',
  };

  return (
    <div className="flex flex-col space-y-8 select-none p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <BrainCircuit className="text-accent-primary" /> Skill Testing Lab
          </h1>
          <p className="text-xs text-text-secondary mt-1">Verify your skill credentials through AI-generated technical quizzes.</p>
        </div>
        <Button variant="ghost" onClick={() => navigate('/skills')} className="text-xs flex items-center gap-1.5 border border-border-subtle cursor-pointer">
          <ArrowLeft size={14} /> Back to Skills
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-status-danger/10 border border-status-danger/30 text-status-danger text-xs rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {skills.length === 0 ? (
        <div className="p-16 text-center border border-dashed border-border-subtle rounded-2xl flex flex-col items-center justify-center">
          <BookOpen className="w-12 h-12 text-text-muted mb-4" />
          <h3 className="text-sm font-bold text-text-primary">No Skills Added Yet</h3>
          <p className="text-xs text-text-secondary max-w-xs mt-1">Please add skills on your Skills Portfolio page before starting a validation test.</p>
          <Button onClick={() => navigate('/skills')} className="mt-4 text-xs cursor-pointer">
            Go Add Skills
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {skills.map((s) => {
            const Icon = CATEGORY_ICONS[s.category] || BookOpen;
            const nextTier = nextTierMap[s.tier];

            return (
              <Card key={s._id} className="hover:border-accent-primary/20 transition-all flex flex-col justify-between p-5 min-h-[140px]">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-bg-card border border-border-subtle text-accent-primary">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-text-primary">{s.name}</h4>
                      <span className="text-[10px] text-text-muted block mt-0.5">{s.category}</span>
                    </div>
                  </div>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-wider ${getTierBadgeStyles(s.tier)}`}>
                    {s.tier || 'UNVERIFIED'}
                  </span>
                </div>

                <div className="pt-4 border-t border-border-subtle/50 flex justify-between items-center mt-auto">
                  <div className="text-[10px] text-text-muted">
                    {s.tier === 'MASTER' ? (
                      <span className="text-status-warning font-semibold">Maximum level reached</span>
                    ) : (
                      <span>Next Tier: <strong className="text-text-primary">{nextTier}</strong></span>
                    )}
                  </div>
                  {nextTier ? (
                    <Button
                      onClick={() => startQuiz(s.name, nextTier)}
                      className="text-[10px] font-black px-4 py-1.5 cursor-pointer"
                    >
                      Take {nextTier} Test
                    </Button>
                  ) : (
                    <div className="text-status-warning flex items-center gap-1 text-[10px] font-bold">
                      <ShieldCheck size={14} /> Certified Master
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
