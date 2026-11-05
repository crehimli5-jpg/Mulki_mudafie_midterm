import React from 'react';
import { QuizQuestion, UserAnswers } from '../types';
import { X, Check } from 'lucide-react';

interface QuestionNavigatorProps {
  isOpen: boolean;
  onClose: () => void;
  questions: QuizQuestion[];
  currentIndex: number;
  userAnswers: UserAnswers;
  onSelectQuestion: (index: number) => void;
}

export const QuestionNavigator: React.FC<QuestionNavigatorProps> = ({
  isOpen,
  onClose,
  questions,
  currentIndex,
  userAnswers,
  onSelectQuestion,
}) => {
  if (!isOpen) return null;

  const answeredCount = Object.keys(userAnswers).length;
  const unansweredCount = questions.length - answeredCount;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="nav-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 id="nav-dialog-title" className="font-bold text-slate-900 dark:text-white text-base">
              Sualların xəritəsi
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              İstənilən suala birbaşa keçid edin
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Xəritəni bağla"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Legend */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-blue-600 dark:bg-blue-500 ring-2 ring-blue-600/30"></span>
            <span className="text-slate-700 dark:text-slate-300 font-medium">Cari sual ({currentIndex + 1})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-slate-700 text-white dark:bg-slate-700 flex items-center justify-center">
              <Check className="w-2.5 h-2.5 stroke-[3]" />
            </span>
            <span className="text-slate-700 dark:text-slate-300">Cavablandırılıb ({answeredCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"></span>
            <span className="text-slate-700 dark:text-slate-300">Cavablandırılmayıb ({unansweredCount})</span>
          </div>
        </div>

        {/* Questions Grid */}
        <div className="p-5 overflow-y-auto flex-1">
          <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
            {questions.map((q, idx) => {
              const isCurrent = idx === currentIndex;
              const isAnswered = !!userAnswers[q.id];

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => {
                    onSelectQuestion(idx);
                    onClose();
                  }}
                  aria-label={`Sual ${idx + 1}${isCurrent ? ' (cari sual)' : ''}${isAnswered ? ' (cavablandırılıb)' : ' (cavabsız)'}`}
                  className={`h-11 rounded-xl text-sm font-semibold transition-all flex flex-col items-center justify-center relative focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                    isCurrent
                      ? 'bg-blue-600 text-white dark:bg-blue-500 ring-4 ring-blue-500/30 shadow-md font-bold z-10'
                      : isAnswered
                      ? 'bg-slate-700 text-white dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 shadow-xs'
                      : 'border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                  }`}
                >
                  <span>{idx + 1}</span>
                  {isAnswered && !isCurrent && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-0.5"></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            Bağla
          </button>
        </div>
      </div>
    </div>
  );
};
