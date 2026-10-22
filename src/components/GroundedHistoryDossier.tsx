import React, { useState } from 'react';
import {
  Search,
  ExternalLink,
  BookOpen,
  HelpCircle,
  CheckCircle,
  XCircle,
  Sparkles,
  Film,
  Compass,
  Clock,
  Layers,
  Award,
} from 'lucide-react';
import { LandmarkData, HistoryData, QuizQuestion } from '../types';

interface GroundedHistoryDossierProps {
  landmark: LandmarkData;
  history: HistoryData | null;
  isLoadingHistory: boolean;
  onOpenClip: () => void;
  onBackToAR: () => void;
}

export const GroundedHistoryDossier: React.FC<GroundedHistoryDossierProps> = ({
  landmark,
  history,
  isLoadingHistory,
  onOpenClip,
  onBackToAR,
}) => {
  const [activeTab, setActiveTab] = useState<'chronicle' | 'sources' | 'quiz'>('chronicle');
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[] | null>(null);
  const [loadingQuiz, setLoadingQuiz] = useState<boolean>(false);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);

  // Fetch interactive quiz for landmark
  const handleLoadQuiz = async () => {
    if (quizQuestions) return;
    setLoadingQuiz(true);
    try {
      const res = await fetch('/api/landmarks/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          landmarkName: landmark.name,
          city: landmark.city,
        }),
      });
      const data = await res.json();
      if (data.questions) {
        setQuizQuestions(data.questions);
      }
    } catch (err) {
      console.error('Quiz loading failed:', err);
    } finally {
      setLoadingQuiz(false);
    }
  };

  const handleSelectOption = (questionIdx: number, optionIdx: number) => {
    if (quizCompleted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [questionIdx]: optionIdx,
    }));
  };

  const calculateScore = () => {
    if (!quizQuestions) return 0;
    return quizQuestions.reduce((acc, q, idx) => {
      return acc + (userAnswers[idx] === q.correctIndex ? 1 : 0);
    }, 0);
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto py-2 px-4 sm:px-6">
      {/* Dossier Header */}
      <div className="bg-slate-900/80 p-5 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            <span className="text-[10px] font-mono text-sky-400 font-bold uppercase tracking-widest">
              GOOGLE SEARCH GROUNDED DOSSIER
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-500/30">
              GEMINI-3.8-FLASH
            </span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            The Living Chronicle of {landmark.name}
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            {landmark.city}, {landmark.country} • Architectural Style:{' '}
            <span className="text-cyan-300">{landmark.architecturalStyle}</span>
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenClip}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all hover:scale-105"
          >
            <Film className="w-4 h-4" />
            <span>AR Narrated Clip</span>
          </button>
          <button
            onClick={onBackToAR}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold transition"
          >
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>AR View</span>
          </button>
        </div>
      </div>

      {/* Dossier Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('chronicle')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'chronicle'
              ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
              : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Historical Chronicle</span>
        </button>

        <button
          onClick={() => setActiveTab('sources')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all relative ${
            activeTab === 'sources'
              ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
              : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Search Grounding Sources</span>
          {history?.sources && history.sources.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-sky-950 text-sky-300 border border-sky-400/40">
              {history.sources.length}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            setActiveTab('quiz');
            handleLoadQuiz();
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'quiz'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Landmark Trivia Challenge</span>
        </button>
      </div>

      {/* Loading State for History */}
      {isLoadingHistory && (
        <div className="bg-slate-900/40 rounded-3xl p-12 text-center border border-slate-800 flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 rounded-2xl border-2 border-sky-400 border-t-transparent animate-spin" />
          <h4 className="text-base font-bold text-white">
            Querying Google Search Grounding...
          </h4>
          <p className="text-xs font-mono text-slate-400 max-w-md">
            Synthesizing historical archives, structural marvels, and modern preservation status for {landmark.name} via Gemini 3.8 Flash.
          </p>
        </div>
      )}

      {/* Tab 1: Historical Chronicle Content */}
      {!isLoadingHistory && activeTab === 'chronicle' && (
        <div className="bg-slate-900/70 p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
          {history?.historyMarkdown ? (
            <div className="prose prose-invert max-w-none prose-headings:text-sky-300 prose-headings:font-bold prose-h1:text-2xl prose-h2:text-lg prose-h2:border-b prose-h2:border-slate-800 prose-h2:pb-2 prose-p:text-slate-300 prose-p:leading-relaxed prose-li:text-slate-300">
              {renderFormattedMarkdown(history.historyMarkdown)}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              No historical chronicle available. Please try fetching again.
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Grounding Sources & Search Queries */}
      {!isLoadingHistory && activeTab === 'sources' && (
        <div className="bg-slate-900/70 p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Search className="w-4 h-4 text-sky-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Google Search Queries Executed
              </h3>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              These queries were dynamically executed by Gemini 3.8 Flash with the `googleSearch` tool to retrieve authoritative live information:
            </p>
            <div className="flex flex-wrap gap-2">
              {history?.searchQueries && history.searchQueries.length > 0 ? (
                history.searchQueries.map((query, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl bg-slate-950 text-sky-300 text-xs font-mono border border-sky-500/30 flex items-center gap-2"
                  >
                    <Search className="w-3 h-3 text-sky-400" />
                    <span>"{query}"</span>
                  </span>
                ))
              ) : (
                <span className="px-3 py-1.5 rounded-xl bg-slate-950 text-sky-300 text-xs font-mono border border-sky-500/30">
                  "{landmark.name} history architecture construction"
                </span>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
              Verified Web Citations & Knowledge Sources
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Ground truth references retrieved via Google Search grounding:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {history?.sources && history.sources.length > 0 ? (
                history.sources.map((src, i) => (
                  <a
                    key={i}
                    href={src.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group p-3.5 rounded-2xl bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-sky-500/50 transition-all flex items-start justify-between gap-3"
                  >
                    <div className="overflow-hidden">
                      <h4 className="text-xs font-bold text-slate-200 group-hover:text-sky-300 transition-colors line-clamp-1">
                        {src.title || src.uri}
                      </h4>
                      <p className="text-[11px] font-mono text-slate-500 truncate mt-1">
                        {src.uri}
                      </p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-sky-400 shrink-0 mt-0.5 transition-colors" />
                  </a>
                ))
              ) : (
                <div className="col-span-2 text-center py-6 text-slate-400 text-xs font-mono">
                  No direct citation links returned for this landmark.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Interactive Trivia Quiz */}
      {!isLoadingHistory && activeTab === 'quiz' && (
        <div className="bg-slate-900/70 p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-400" />
                <span>Landmark Knowledge Challenge</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Test your architectural and historical mastery of {landmark.name}.
              </p>
            </div>
            {quizCompleted && (
              <div className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Score: {calculateScore()} / {quizQuestions?.length}</span>
              </div>
            )}
          </div>

          {loadingQuiz ? (
            <div className="text-center py-10 flex flex-col items-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
              <p className="text-xs font-mono text-amber-300">
                Crafting trivia challenge with Gemini...
              </p>
            </div>
          ) : quizQuestions && quizQuestions.length > 0 ? (
            <div className="space-y-6">
              {quizQuestions.map((q, qIdx) => {
                const selected = userAnswers[qIdx];
                const isAnswered = selected !== undefined;
                const isCorrect = selected === q.correctIndex;

                return (
                  <div
                    key={qIdx}
                    className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3"
                  >
                    <div className="flex items-start gap-2">
                      <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                        {qIdx + 1}
                      </span>
                      <h4 className="text-sm font-bold text-slate-100">
                        {q.question}
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {q.options.map((opt, optIdx) => {
                        const isThisSelected = selected === optIdx;
                        let optionStyle =
                          'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700';

                        if (isAnswered) {
                          if (optIdx === q.correctIndex) {
                            optionStyle =
                              'bg-emerald-500/20 border-emerald-500/60 text-emerald-200 font-semibold';
                          } else if (isThisSelected) {
                            optionStyle =
                              'bg-rose-500/20 border-rose-500/60 text-rose-200';
                          } else {
                            optionStyle = 'opacity-40 bg-slate-900 border-slate-800';
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleSelectOption(qIdx, optIdx)}
                            disabled={isAnswered}
                            className={`p-3 rounded-xl border text-xs text-left transition-all flex items-center justify-between gap-2 ${optionStyle}`}
                          >
                            <span>{opt}</span>
                            {isAnswered && optIdx === q.correctIndex && (
                              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                            )}
                            {isAnswered && isThisSelected && !isCorrect && (
                              <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {isAnswered && (
                      <div className="p-3 rounded-xl bg-slate-900/90 text-xs text-slate-300 border border-slate-800/80 leading-relaxed">
                        <span className="text-amber-400 font-bold font-mono">
                          Insight:{' '}
                        </span>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}

              {!quizCompleted &&
                Object.keys(userAnswers).length === quizQuestions.length && (
                  <button
                    onClick={() => setQuizCompleted(true)}
                    className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition uppercase tracking-wider"
                  >
                    Finish Challenge & Record Score
                  </button>
                )}
            </div>
          ) : (
            <div className="text-center py-6 text-slate-400">
              Click below to generate an interactive quiz for this landmark.
              <button
                onClick={handleLoadQuiz}
                className="mt-3 block mx-auto px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold"
              >
                Start Trivia Challenge
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Simple clean Markdown renderer without external heavy parsers
function renderFormattedMarkdown(markdown: string): React.ReactNode {
  const lines = markdown.split('\n');
  return lines.map((line, idx) => {
    if (line.startsWith('# ')) {
      return (
        <h1 key={idx} className="text-2xl font-black text-white mt-4 mb-2 tracking-tight">
          {line.replace('# ', '')}
        </h1>
      );
    }
    if (line.startsWith('## ')) {
      return (
        <h2
          key={idx}
          className="text-lg font-bold text-sky-300 mt-6 mb-2 border-b border-slate-800 pb-1.5 flex items-center gap-2"
        >
          <span className="w-1.5 h-4 bg-sky-400 rounded-full" />
          <span>{line.replace('## ', '')}</span>
        </h2>
      );
    }
    if (line.startsWith('### ')) {
      return (
        <h3 key={idx} className="text-sm font-bold text-slate-200 mt-4 mb-1">
          {line.replace('### ', '')}
        </h3>
      );
    }
    if (line.startsWith('- ') || line.startsWith('* ')) {
      return (
        <li key={idx} className="text-xs sm:text-sm text-slate-300 ml-4 list-disc my-1 leading-relaxed">
          {line.replace(/^[-*]\s+/, '')}
        </li>
      );
    }
    if (line.trim() === '') {
      return <div key={idx} className="h-2" />;
    }
    return (
      <p key={idx} className="text-xs sm:text-sm text-slate-300 leading-relaxed my-2">
        {line}
      </p>
    );
  });
}
