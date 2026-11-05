import React, { useState, useMemo } from 'react';
import { QuizQuestion, UserAnswers, ReviewFilter } from '../types';
import { calculateQuizStats, getReviewList } from '../utils/quiz';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  RefreshCw,
  ArrowLeft,
  Trophy,
  AlertCircle,
  BookOpen,
  Filter,
} from 'lucide-react';

interface ResultsScreenProps {
  questions: QuizQuestion[];
  userAnswers: UserAnswers;
  onRetryErrors: () => void;
  onRestartSameTopics: () => void;
  onReturnToTopics: () => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  questions,
  userAnswers,
  onRetryErrors,
  onRestartSameTopics,
  onReturnToTopics,
}) => {
  const [activeFilter, setActiveFilter] = useState<ReviewFilter>('all');

  const stats = useMemo(
    () => calculateQuizStats(questions, userAnswers),
    [questions, userAnswers]
  );

  const reviewItems = useMemo(
    () => getReviewList(questions, userAnswers, activeFilter),
    [questions, userAnswers, activeFilter]
  );

  // Total errors count (wrong + unanswered)
  const hasErrors = stats.incorrectTotal > 0;

  // Grade/feedback message
  const feedback = useMemo(() => {
    if (stats.percentage >= 90) {
      return {
        badge: 'Əla nəticə!',
        color: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800',
        desc: 'Mülki müdafiə fənni üzrə materialı mükəmməl mənimsəmisiniz.',
      };
    }
    if (stats.percentage >= 70) {
      return {
        badge: 'Yaxşı nəticə!',
        color: 'text-blue-600 dark:text-blue-400',
        bg: 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800',
        desc: 'Ümumi bilik səviyyəniz qənaətbəxşdir, səhvlərinizə nəzər salın.',
      };
    }
    if (stats.percentage >= 50) {
      return {
        badge: 'Kafi nəticə',
        color: 'text-amber-600 dark:text-amber-400',
        bg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800',
        desc: 'İmtahanda yüksək bal üçün zəif mövzuları təkrar etmək tövsiyə olunur.',
      };
    }
    return {
      badge: 'Zəif nəticə',
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800',
      desc: 'Mövzuları dərindən oxuyub yenidən testdən keçməyiniz məsləhətdir.',
    };
  }, [stats.percentage]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Big Score Summary Hero */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm text-center space-y-5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border mb-1">
          <Trophy className="w-4 h-4 text-amber-500" />
          <span className={feedback.color}>{feedback.badge}</span>
        </div>

        <div className="flex flex-col items-center justify-center">
          <div className="text-5xl sm:text-7xl font-black text-slate-900 dark:text-white tracking-tight">
            {stats.percentage}%
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 max-w-md mx-auto">
            {feedback.desc}
          </p>
        </div>

        {/* 3 Main Numbers: Düzgün, Yanlış, Cavablandırılmayıb */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
          {/* Correct */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80 flex items-center gap-3.5 text-left">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-600/30">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-medium text-emerald-800 dark:text-emerald-300">
                Düzgün
              </div>
              <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                {stats.correctCount}{' '}
                <span className="text-xs font-normal text-emerald-700 dark:text-emerald-400">
                  / {stats.total}
                </span>
              </div>
            </div>
          </div>

          {/* Wrong */}
          <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border-2 border-rose-300 dark:border-rose-800 flex items-center gap-3.5 text-left">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-rose-600/30">
              <XCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-medium text-rose-800 dark:text-rose-300">
                Yanlış
              </div>
              <div className="text-2xl font-bold text-rose-900 dark:text-rose-100">
                {stats.wrongCount}{' '}
                <span className="text-xs font-normal text-rose-700 dark:text-rose-400">
                  / {stats.total}
                </span>
              </div>
            </div>
          </div>

          {/* Unanswered */}
          <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border-2 border-amber-300 dark:border-amber-800 flex items-center gap-3.5 text-left">
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-amber-600/30">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-medium text-amber-800 dark:text-amber-300">
                Cavablandırılmayıb
              </div>
              <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                {stats.unansweredCount}{' '}
                <span className="text-xs font-normal text-amber-700 dark:text-amber-400">
                  / {stats.total}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Highlighted Combined Missed Metric Box */}
        <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>
            Düzgün cavablandırılmamış sualların cəmi (Yanlış + Cavabsız):{' '}
            <strong className="text-rose-600 dark:text-rose-400 text-base">
              {stats.incorrectTotal} sual
            </strong>
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {hasErrors && (
          <button
            type="button"
            onClick={onRetryErrors}
            className="w-full py-3.5 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 dark:bg-rose-500 dark:hover:bg-rose-600 text-white font-bold text-sm shadow-md shadow-rose-600/20 transition-all flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Yalnız səhvlərimi təkrar et ({stats.incorrectTotal})</span>
          </button>
        )}

        <button
          type="button"
          onClick={onRestartSameTopics}
          className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 ${
            hasErrors
              ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 dark:bg-blue-500 dark:hover:bg-blue-600 text-white shadow-md shadow-blue-600/20 focus-visible:ring-blue-500'
              : 'col-span-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-md shadow-emerald-600/20 focus-visible:ring-emerald-500'
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          <span>Eyni mövzularla yenidən başla</span>
        </button>

        <button
          type="button"
          onClick={onReturnToTopics}
          className="w-full py-3.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-sm border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Mövzu seçiminə qayıt</span>
        </button>
      </div>

      {/* Review Section */}
      <div className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>Səhvlərin və cavabsızların təhlili</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Düzgün cavablandırılmamış sualları gözdən keçirin
            </p>
          </div>

          {/* Filter Tabs: Hamısı / Yanlış / Cavabsız */}
          {hasErrors && (
            <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  activeFilter === 'all'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Hamısı ({stats.incorrectTotal})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('wrong')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  activeFilter === 'wrong'
                    ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Yanlış ({stats.wrongCount})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('unanswered')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  activeFilter === 'unanswered'
                    ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Cavabsız ({stats.unansweredCount})
              </button>
            </div>
          )}
        </div>

        {/* If 100% correct and no errors exist */}
        {!hasErrors ? (
          <div className="p-8 rounded-3xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-600/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-100">
              Heç bir səhviniz yoxdur!
            </h3>
            <p className="text-sm text-emerald-700 dark:text-emerald-300 max-w-md mx-auto">
              Bütün sualları qüsursuz cavablandırdınız. Təbriklər!
            </p>
          </div>
        ) : reviewItems.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-center text-sm text-slate-500 dark:text-slate-400">
            Seçilmiş filtr üzrə sual tapılmadı.
          </div>
        ) : (
          <div className="space-y-4">
            {reviewItems.map((item, idx) => (
              <div
                key={item.question.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4"
              >
                {/* Header: Question Number, Topic Badge, Status Badge */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center justify-center">
                      #{item.question.id}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      Mövzu {item.question.topicId}
                    </span>
                  </div>

                  {item.status === 'wrong' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                      <XCircle className="w-3.5 h-3.5" />
                      Yanlış cavab
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                      <HelpCircle className="w-3.5 h-3.5" />
                      Cavab verilməyib
                    </span>
                  )}
                </div>

                {/* Question text */}
                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-relaxed">
                  {item.question.questionText}
                </h3>

                {/* Answers Box */}
                <div className="space-y-2.5 pt-1 text-sm">
                  {/* User's choice (if answered wrongly) */}
                  {item.status === 'wrong' && item.userAnswer && (
                    <div className="p-3.5 rounded-xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300 block mb-0.5">
                          Sizin seçiminiz (Yanlış):
                        </span>
                        <div className="text-rose-950 dark:text-rose-100">
                          <strong className="mr-1.5 font-bold">[{item.userAnswer.letter}]</strong>
                          {item.userAnswer.text}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* If unanswered */}
                  {item.status === 'unanswered' && (
                    <div className="p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 block mb-0.5">
                          Sizin seçiminiz:
                        </span>
                        <span className="text-amber-900 dark:text-amber-200 italic font-medium">
                          Cavab verilməyib
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Correct answer */}
                  <div className="p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 block mb-0.5">
                        Düzgün cavab:
                      </span>
                      <div className="text-emerald-950 dark:text-emerald-100">
                        <strong className="mr-1.5 font-bold">[{item.correctAnswer.letter}]</strong>
                        {item.correctAnswer.text}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
