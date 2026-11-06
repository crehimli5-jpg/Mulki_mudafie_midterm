import React, { useState, useEffect, useCallback } from 'react';
import { QuizQuestion, UserAnswers } from '../types';
import { QuestionNavigator } from './QuestionNavigator';
import { ConfirmModal } from './ConfirmModal';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
  LayoutGrid,
  LogOut,
  Flag,
  Sparkles,
} from 'lucide-react';

interface QuizScreenProps {
  questions: QuizQuestion[];
  userAnswers: UserAnswers;
  onAnswerQuestion: (questionId: number, optionId: string) => void;
  onFinishQuiz: () => void;
  onQuitQuiz: () => void;
}

export const QuizScreen: React.FC<QuizScreenProps> = ({
  questions,
  userAnswers,
  onAnswerQuestion,
  onFinishQuiz,
  onQuitQuiz,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isNavigatorOpen, setIsNavigatorOpen] = useState(false);
  const [isFinishConfirmOpen, setIsFinishConfirmOpen] = useState(false);
  const [isQuitConfirmOpen, setIsQuitConfirmOpen] = useState(false);

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex];
  const selectedOptionId = userAnswers[currentQuestion.id];

  // Number of unanswered questions
  const unansweredCount = questions.filter((q) => !userAnswers[q.id]).length;

  // Handle option selection
  const handleSelectOption = useCallback(
    (optionId: string) => {
      // If "Düzgün cavabı göstər" switch is ON, the question is locked
      if (showAnswer) return;
      onAnswerQuestion(currentQuestion.id, optionId);
    },
    [showAnswer, onAnswerQuestion, currentQuestion.id]
  );

  // Navigation handlers
  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, totalQuestions]);

  const handleFinishAttempt = useCallback(() => {
    if (unansweredCount > 0) {
      setIsFinishConfirmOpen(true);
    } else {
      onFinishQuiz();
    }
  }, [unansweredCount, onFinishQuiz]);

  // Keyboard shortcut listener:
  // ← (ArrowLeft) for previous, → (ArrowRight) for next
  // A–F or 1–6 to choose an option
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is in an open modal dialog or typing in an input
      if (isNavigatorOpen || isFinishConfirmOpen || isQuitConfirmOpen) {
        if (e.key === 'Escape') {
          setIsNavigatorOpen(false);
          setIsFinishConfirmOpen(false);
          setIsQuitConfirmOpen(false);
        }
        return;
      }

      const activeElement = document.activeElement;
      if (activeElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeElement.tagName)) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (currentIndex < totalQuestions - 1) {
          handleNext();
        } else {
          handleFinishAttempt();
        }
      } else {
        // Option selection via keyboard: 1-6 or A-F
        const key = e.key.toUpperCase();
        let targetIndex = -1;

        if (key >= '1' && key <= '9') {
          targetIndex = parseInt(key, 10) - 1;
        } else if (key >= 'A' && key <= 'F') {
          targetIndex = key.charCodeAt(0) - 65; // A=0, B=1, ...
        }

        if (targetIndex >= 0 && targetIndex < currentQuestion.options.length) {
          e.preventDefault();
          const targetOption = currentQuestion.options[targetIndex];
          if (targetOption) {
            handleSelectOption(targetOption.id);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isNavigatorOpen,
    isFinishConfirmOpen,
    isQuitConfirmOpen,
    currentIndex,
    totalQuestions,
    currentQuestion,
    handlePrev,
    handleNext,
    handleFinishAttempt,
    handleSelectOption,
  ]);

  // Progress percentage
  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Top Bar: Quit button, Question Navigator button, Answer Reveal Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsQuitConfirmOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Testi dayandır</span>
          </button>

          <button
            type="button"
            onClick={() => setIsNavigatorOpen(true)}
            aria-label="Bütün sualların siyahısını aç"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Xəritə</span>
            <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-[10px] font-bold">
              {Object.keys(userAnswers).length}/{totalQuestions}
            </span>
          </button>
        </div>

        {/* Switch: "Düzgün cavabı göstər" */}
        <label
          htmlFor="reveal-answer-switch"
          className="inline-flex items-center gap-2.5 cursor-pointer select-none"
        >
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Düzgün cavabı göstər
          </span>
          <div className="relative">
            <input
              type="checkbox"
              id="reveal-answer-switch"
              checked={showAnswer}
              onChange={(e) => setShowAnswer(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 dark:peer-focus:ring-blue-600 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-600"></div>
          </div>
        </label>
      </div>

      {/* Progress Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span
            aria-live="polite"
            className="text-slate-900 dark:text-white font-bold text-sm tracking-tight"
          >
            Sual {currentIndex + 1} / {totalQuestions}
          </span>
          <span className="text-slate-500 dark:text-slate-400">
            {progressPercent}% tamamlandı
          </span>
        </div>

        {/* Progress Bar */}
        <div
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Test tərəqqisi: ${currentIndex + 1} / ${totalQuestions}`}
          className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden"
        >
          <div
            className="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 sm:p-7 space-y-6">
        {/* Topic Badge & Status */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            Mövzu {currentQuestion.topicId}
          </span>

          {showAnswer && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              <Sparkles className="w-3.5 h-3.5" />
              Cavab rejimi aktivdir (Sual kilidlidir)
            </span>
          )}
        </div>

        {/* Question Text */}
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-relaxed">
          {currentQuestion.questionText}
        </h2>

        {/* Options List */}
        <div
          role="radiogroup"
          aria-label={`Sual ${currentIndex + 1} variantları`}
          className="space-y-3"
        >
          {currentQuestion.options.map((option, optIdx) => {
            const isSelected = selectedOptionId === option.id;
            const isCorrect = option.isCorrect;

            let cardStyles =
              'border border-slate-200 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600';
            let badgeStyles =
              'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600';
            let iconElement: React.ReactNode = null;
            let statusText: string | null = null;

            if (showAnswer) {
              // Answer reveal mode
              if (isCorrect) {
                // Correct option (always green when showAnswer is true)
                cardStyles =
                  'border-2 border-emerald-500 bg-emerald-50/90 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 shadow-xs';
                badgeStyles =
                  'bg-emerald-600 text-white border-transparent font-bold';
                iconElement = <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />;
                statusText = isSelected ? 'Düzgün seçiminiz!' : 'Düzgün cavab';
              } else if (isSelected && !isCorrect) {
                // User picked wrong option
                cardStyles =
                  'border-2 border-rose-500 bg-rose-50/90 dark:bg-rose-950/40 text-rose-950 dark:text-rose-100 shadow-xs';
                badgeStyles =
                  'bg-rose-600 text-white border-transparent font-bold';
                iconElement = <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />;
                statusText = 'Sizin seçiminiz (Yanlış)';
              } else {
                // Neutral non-selected wrong options
                cardStyles =
                  'border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 text-slate-400 dark:text-slate-500 opacity-60';
                badgeStyles =
                  'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700';
              }
            } else {
              // Normal quiz mode (switch OFF)
              if (isSelected) {
                cardStyles =
                  'border-2 border-blue-600 dark:border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 text-blue-950 dark:text-blue-100 ring-2 ring-blue-500/20 shadow-xs';
                badgeStyles =
                  'bg-blue-600 dark:bg-blue-500 text-white border-transparent font-bold';
                statusText = 'Seçilib';
              }
            }

            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                disabled={showAnswer}
                onClick={() => handleSelectOption(option.id)}
                className={`w-full text-left p-4 rounded-xl transition-all flex items-start gap-3.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${cardStyles} ${
                  showAnswer ? 'cursor-default' : 'cursor-pointer active:scale-[0.99]'
                }`}
              >
                {/* Letter Badge (A, B, C, D, E, F) */}
                <span
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 transition-colors ${badgeStyles}`}
                >
                  {option.letter}
                </span>

                {/* Option Text */}
                <div className="flex-1 min-w-0 pt-0.5 text-sm sm:text-base leading-relaxed">
                  {option.text}
                </div>

                {/* Status Indicator / Icon */}
                <div className="shrink-0 flex items-center gap-1.5 pt-0.5">
                  {iconElement}
                  {statusText && (
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-md hidden xs:inline-block ${
                        showAnswer && isCorrect
                          ? 'bg-emerald-200 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200'
                          : showAnswer && isSelected && !isCorrect
                          ? 'bg-rose-200 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200'
                          : 'bg-blue-200 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200'
                      }`}
                    >
                      {statusText}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="flex-1 sm:flex-initial px-5 py-3.5 rounded-xl font-bold text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>← Əvvəlki sual</span>
        </button>

        {currentIndex === totalQuestions - 1 ? (
          <button
            type="button"
            onClick={handleFinishAttempt}
            className="flex-1 sm:flex-initial px-6 py-3.5 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <Flag className="w-4 h-4" />
            <span>Testi bitir</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            className="flex-1 sm:flex-initial px-6 py-3.5 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-700 active:bg-blue-800 dark:bg-blue-500 dark:hover:bg-blue-600 text-white transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <span>Növbəti sual →</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="text-center text-xs text-slate-400 dark:text-slate-500 hidden sm:block">
        Klaviatura qısayolları: <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[11px]">←</kbd> / <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[11px]">→</kbd> ilə keçid, <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[11px]">A-F</kbd> və ya <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-[11px]">1-6</kbd> ilə variant seçimi
      </div>

      {/* Question Navigator Grid Modal */}
      <QuestionNavigator
        isOpen={isNavigatorOpen}
        onClose={() => setIsNavigatorOpen(false)}
        questions={questions}
        currentIndex={currentIndex}
        userAnswers={userAnswers}
        onSelectQuestion={(newIdx) => setCurrentIndex(newIdx)}
      />

      {/* Finish Confirmation Dialog */}
      <ConfirmModal
        isOpen={isFinishConfirmOpen}
        title="Testi tamamlamaq istəyirsiniz?"
        message={`${unansweredCount} sual cavablandırılmayıb. Yenə də bitirmək istəyirsiniz?`}
        confirmLabel="Bəli, testi bitir"
        cancelLabel="Geri qayıt"
        onConfirm={() => {
          setIsFinishConfirmOpen(false);
          onFinishQuiz();
        }}
        onCancel={() => setIsFinishConfirmOpen(false)}
        isDestructive={true}
      />

      {/* Quit Confirmation Dialog */}
      <ConfirmModal
        isOpen={isQuitConfirmOpen}
        title="Testi dayandırmaq istəyirsiniz?"
        message="Testi dayandırıb başlanğıc səhifəyə qayıtmaq istədiyinizdən əminsiniz? Cavablarınız saxlanılmayacaq."
        confirmLabel="Bəli, dayandır"
        cancelLabel="Testə davam et"
        onConfirm={() => {
          setIsQuitConfirmOpen(false);
          onQuitQuiz();
        }}
        onCancel={() => setIsQuitConfirmOpen(false)}
        isDestructive={true}
      />
    </div>
  );
};
