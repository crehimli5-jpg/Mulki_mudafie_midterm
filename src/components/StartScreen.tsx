import React, { useMemo } from 'react';
import { RawTopic } from '../types';
import {
  CheckSquare,
  Square,
  Play,
  RotateCcw,
  CheckCircle2,
  BookOpen,
  Sliders,
  Layers,
  HelpCircle,
} from 'lucide-react';

interface StartScreenProps {
  topics: RawTopic[];
  selectedTopicIds: number[];
  countLimit: number | 'all';
  onToggleTopic: (topicId: number) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  onChangeCountLimit: (limit: number | 'all') => void;
  onStartQuiz: () => void;
  totalAvailableQuestions: number;
}

const COUNT_OPTIONS: Array<{ label: string; value: number | 'all' }> = [
  { label: 'Hamısı', value: 'all' },
  { label: '10', value: 10 },
  { label: '20', value: 20 },
  { label: '30', value: 30 },
  { label: '50', value: 50 },
];

export const StartScreen: React.FC<StartScreenProps> = ({
  topics,
  selectedTopicIds,
  countLimit,
  onToggleTopic,
  onSelectAll,
  onClearAll,
  onChangeCountLimit,
  onStartQuiz,
  totalAvailableQuestions,
}) => {
  // Calculate total questions in selected topics
  const selectedQuestionsCount = useMemo(() => {
    const selectedSet = new Set(selectedTopicIds);
    return topics
      .filter((t) => selectedSet.has(t.id))
      .reduce((sum, t) => sum + t.count, 0);
  }, [topics, selectedTopicIds]);

  // Actual number of questions that will be taken
  const questionsToTake = useMemo(() => {
    if (selectedQuestionsCount === 0) return 0;
    if (countLimit === 'all') return selectedQuestionsCount;
    return Math.min(countLimit, selectedQuestionsCount);
  }, [selectedQuestionsCount, countLimit]);

  const hasAnySelected = selectedTopicIds.length > 0;
  const isAllSelected = selectedTopicIds.length === topics.length;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      {/* Title & Introduction */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold uppercase tracking-wider">
          <BookOpen className="w-3.5 h-3.5" />
          Universitet İmtahanına Hazırlıq
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Mülki müdafiə – Özünüsınaq testi
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
          Mövzuları seçərək biliyinizi yoxlayın. Hər testdə suallar və variantlar qarışdırılır, düzgün cavablar dəqiqliklə qorunur.
        </p>

        {/* Total Questions Verification Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>Ümumi sual fondu: <strong>{totalAvailableQuestions} sual</strong> (7 mövzu)</span>
        </div>
      </div>

      {/* Topics Selection Box */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Controls Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="font-bold text-slate-900 dark:text-white text-base">
              Mövzular ({topics.length})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onSelectAll}
              disabled={isAllSelected}
              className="px-3 py-1.5 text-xs font-medium rounded-lg text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Hamısını seç
            </button>
            <button
              type="button"
              onClick={onClearAll}
              disabled={!hasAnySelected}
              className="px-3 py-1.5 text-xs font-medium rounded-lg text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Təmizlə
            </button>
          </div>
        </div>

        {/* Topic rows */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {topics.map((topic) => {
            const isChecked = selectedTopicIds.includes(topic.id);
            return (
              <label
                key={topic.id}
                htmlFor={`topic-checkbox-${topic.id}`}
                className={`flex items-start gap-3.5 px-5 py-3.5 cursor-pointer select-none transition-colors ${
                  isChecked
                    ? 'bg-blue-50/40 dark:bg-blue-950/20 hover:bg-blue-50/70 dark:hover:bg-blue-950/30'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="pt-0.5">
                  <input
                    type="checkbox"
                    id={`topic-checkbox-${topic.id}`}
                    checked={isChecked}
                    onChange={() => onToggleTopic(topic.id)}
                    className="sr-only"
                  />
                  <div
                    aria-hidden="true"
                    className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                      isChecked
                        ? 'bg-blue-600 text-white dark:bg-blue-500'
                        : 'border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                    }`}
                  >
                    {isChecked ? (
                      <CheckSquare className="w-4 h-4 fill-current" />
                    ) : (
                      <Square className="w-3.5 h-3.5 opacity-0" />
                    )}
                  </div>
                </div>

                <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-4">
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    <span className="font-semibold text-blue-600 dark:text-blue-400 mr-1.5">
                      Mövzu {topic.id}.
                    </span>
                    <span>{topic.title}</span>
                  </div>

                  <span className="self-start sm:self-auto shrink-0 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                    {topic.count} sual
                  </span>
                </div>
              </label>
            );
          })}
        </div>

        {/* Live selected questions count footer */}
        <div className="px-5 py-3.5 bg-slate-50/80 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-sm">
          <span className="text-slate-600 dark:text-slate-400">
            Seçilmiş sual sayı:
          </span>
          <span className="font-bold text-slate-900 dark:text-white text-base">
            {selectedQuestionsCount} sual
          </span>
        </div>
      </div>

      {/* Sual sayı selector */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="font-bold text-slate-900 dark:text-white text-base">
              Sual sayı
            </h2>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Testdə veriləcək sualların miqdarı
          </span>
        </div>

        <div className="grid grid-cols-5 gap-2" role="radiogroup" aria-label="Sual sayı seçimi">
          {COUNT_OPTIONS.map((opt) => {
            const isSelected = countLimit === opt.value;
            // Disable if numerical option is greater than selected questions
            const isDisabled =
              typeof opt.value === 'number' &&
              (selectedQuestionsCount === 0 || selectedQuestionsCount < opt.value);

            return (
              <button
                key={String(opt.value)}
                type="button"
                role="radio"
                aria-checked={isSelected}
                disabled={isDisabled}
                onClick={() => onChangeCountLimit(opt.value)}
                className={`py-3 px-2 rounded-xl text-center font-semibold text-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                  isSelected
                    ? 'bg-blue-600 text-white dark:bg-blue-500 shadow-md shadow-blue-500/25 ring-2 ring-blue-600 dark:ring-blue-500'
                    : isDisabled
                    ? 'bg-slate-100 dark:bg-slate-800/40 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-60 border border-dashed border-slate-200 dark:border-slate-800'
                    : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div>{opt.label}</div>
                {typeof opt.value === 'number' && (
                  <div className="text-[10px] font-normal opacity-80 mt-0.5">sual</div>
                )}
              </button>
            );
          })}
        </div>

        {selectedQuestionsCount > 0 && countLimit !== 'all' && (
          <p className="text-xs text-slate-500 dark:text-slate-400 pt-1">
            Seçilmiş {selectedQuestionsCount} sual arasından təsadüfi {questionsToTake} sual seçiləcək.
          </p>
        )}
      </div>

      {/* Start Button & Helper Info */}
      <div className="space-y-4 pt-2">
        <button
          type="button"
          onClick={onStartQuiz}
          disabled={!hasAnySelected}
          className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-bold text-lg shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all flex items-center justify-center gap-3 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/50"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>
            {hasAnySelected
              ? `Testə başla (${questionsToTake} sual)`
              : 'Mövzu seçin'}
          </span>
        </button>

        {!hasAnySelected && (
          <p className="text-center text-xs text-amber-600 dark:text-amber-400 font-medium">
            Testə başlamaq üçün ən azı bir mövzu seçilməlidir.
          </p>
        )}

        {/* Feature Highlights Footer */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-100/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
            <span>Fisher-Yates alqoritmi ilə sual və cavabların qarışdırılması</span>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-100/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>İmtahan zamanı ani cavab göstərmə imkanı</span>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-100/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0" />
            <span>Səhvlərin və cavabsızların detallı analizi</span>
          </div>
        </div>
      </div>
    </div>
  );
};
