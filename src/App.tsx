import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { StartScreen } from './components/StartScreen';
import { QuizScreen } from './components/QuizScreen';
import { ResultsScreen } from './components/ResultsScreen';
import { ThemeProvider } from './context/ThemeContext';
import {
  RawQuestion,
  RawTopic,
  QuizQuestion,
  UserAnswers,
  QuestionSetId,
} from './types';
import {
  prepareQuizQuestions,
  prepareRetryQuizFromMissed,
  loadSavedSettings,
  saveSettings,
} from './utils/quiz';

// Import local questions data verbatim
import rawData from './data/questions.json';
import r25Data from './data/r25.json';

export default function App() {
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  );
}

function MainApp() {
  // Screen state: 'start' | 'quiz' | 'results'
  const [screen, setScreen] = useState<'start' | 'quiz' | 'results'>('start');

  // Load initial settings from localStorage (try/catch protected in quiz.ts)
  const initialSettings = useMemo(() => loadSavedSettings([1, 2, 3, 4, 5, 6, 7]), []);

  // Active question set: 'lecture' (367 questions) or 'r25' (204 questions)
  const [activeSet, setActiveSet] = useState<QuestionSetId>(initialSettings.questionSet);

  // Active dataset derived from activeSet
  const currentDataset = useMemo(() => {
    return activeSet === 'r25' ? r25Data : rawData;
  }, [activeSet]);

  const allTopics: RawTopic[] = currentDataset.topics;
  const allQuestions: RawQuestion[] = currentDataset.questions;

  // Topic selection & question count limit (restored from localStorage)
  const defaultTopicIds = useMemo(() => [1, 2, 3, 4, 5, 6, 7], []);
  const [selectedTopicIds, setSelectedTopicIds] = useState<number[]>(initialSettings.selectedTopicIds);
  const [countLimit, setCountLimit] = useState<number | 'all'>(initialSettings.countLimit);

  // Active quiz state
  const [activeQuestions, setActiveQuestions] = useState<QuizQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<UserAnswers>({});

  // Sync settings changes to localStorage
  useEffect(() => {
    saveSettings({
      questionSet: activeSet,
      selectedTopicIds,
      countLimit,
    });
  }, [activeSet, selectedTopicIds, countLimit]);

  // Handle switching active question set
  const handleSelectSet = useCallback((newSet: QuestionSetId) => {
    setActiveSet(newSet);
  }, []);

  // Handle topic toggle
  const handleToggleTopic = useCallback((topicId: number) => {
    setSelectedTopicIds((prev) => {
      if (prev.includes(topicId)) {
        return prev.filter((id) => id !== topicId);
      } else {
        return [...prev, topicId].sort((a, b) => a - b);
      }
    });
  }, []);

  const handleSelectAllTopics = useCallback(() => {
    setSelectedTopicIds(allTopics.map((t) => t.id));
  }, []);

  const handleClearAllTopics = useCallback(() => {
    setSelectedTopicIds([]);
  }, []);

  const handleChangeCountLimit = useCallback((limit: number | 'all') => {
    setCountLimit(limit);
  }, []);

  // Start Quiz: fresh Fisher-Yates shuffle of questions and options
  const handleStartQuiz = useCallback(() => {
    if (selectedTopicIds.length === 0) return;

    const prepared = prepareQuizQuestions(
      allQuestions,
      allTopics,
      selectedTopicIds,
      countLimit
    );

    setActiveQuestions(prepared);
    setUserAnswers({});
    setScreen('quiz');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [allQuestions, allTopics, selectedTopicIds, countLimit]);

  // Support ?autostart=1 query param (Ultra Mode testability requirement)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1' && screen === 'start') {
      const prepared = prepareQuizQuestions(
        allQuestions,
        allTopics,
        selectedTopicIds.length > 0 ? selectedTopicIds : defaultTopicIds,
        10
      );
      setActiveQuestions(prepared);
      setUserAnswers({});
      setScreen('quiz');
    }
  }, [screen, allQuestions, allTopics, selectedTopicIds, defaultTopicIds]);

  // Record question answer
  const handleAnswerQuestion = useCallback((questionId: number, optionId: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  }, []);

  // Finish quiz -> Results screen
  const handleFinishQuiz = useCallback(() => {
    setScreen('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Quit quiz -> Return to Start screen
  const handleQuitQuiz = useCallback(() => {
    setActiveQuestions([]);
    setUserAnswers({});
    setScreen('start');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Retry missed (wrong + unanswered) questions
  const handleRetryErrors = useCallback(() => {
    const missedOriginalIds: number[] = [];

    for (const q of activeQuestions) {
      const chosenId = userAnswers[q.id];
      if (!chosenId) {
        missedOriginalIds.push(q.originalId);
      } else {
        const chosen = q.options.find((opt) => opt.id === chosenId);
        if (!chosen?.isCorrect) {
          missedOriginalIds.push(q.originalId);
        }
      }
    }

    if (missedOriginalIds.length === 0) return;

    const retryQuestions = prepareRetryQuizFromMissed(
      allQuestions,
      allTopics,
      missedOriginalIds
    );

    setActiveQuestions(retryQuestions);
    setUserAnswers({});
    setScreen('quiz');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [allQuestions, allTopics, activeQuestions, userAnswers]);

  // Restart with same topics & count limit, freshly reshuffled
  const handleRestartSameTopics = useCallback(() => {
    handleStartQuiz();
  }, [handleStartQuiz]);

  // Return to topics selection
  const handleReturnToTopics = useCallback(() => {
    setScreen('start');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const activeSetName = activeSet === 'r25' ? 'R25' : 'Mühazirə sualları';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Header
        onTitleClick={handleReturnToTopics}
        activeSetLabel={activeSetName}
        subtitle={
          screen === 'quiz'
            ? 'Test icrası'
            : screen === 'results'
            ? 'Nəticələr və təhlil'
            : undefined
        }
      />

      <main className="flex-1 pb-12">
        {screen === 'start' && (
          <StartScreen
            topics={allTopics}
            selectedTopicIds={selectedTopicIds}
            countLimit={countLimit}
            activeSet={activeSet}
            onSelectSet={handleSelectSet}
            onToggleTopic={handleToggleTopic}
            onSelectAll={handleSelectAllTopics}
            onClearAll={handleClearAllTopics}
            onChangeCountLimit={handleChangeCountLimit}
            onStartQuiz={handleStartQuiz}
            totalAvailableQuestions={allQuestions.length}
          />
        )}

        {screen === 'quiz' && activeQuestions.length > 0 && (
          <QuizScreen
            questions={activeQuestions}
            userAnswers={userAnswers}
            onAnswerQuestion={handleAnswerQuestion}
            onFinishQuiz={handleFinishQuiz}
            onQuitQuiz={handleQuitQuiz}
          />
        )}

        {screen === 'results' && activeQuestions.length > 0 && (
          <ResultsScreen
            questions={activeQuestions}
            userAnswers={userAnswers}
            onRetryErrors={handleRetryErrors}
            onRestartSameTopics={handleRestartSameTopics}
            onReturnToTopics={handleReturnToTopics}
          />
        )}
      </main>

      <footer className="border-t border-slate-200/60 dark:border-slate-800/80 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-4xl mx-auto px-4">
          <p>
            © 2026 Mülki müdafiə imtahanına hazırlıq portalı.{' '}
            {activeSet === 'r25' ? 'R25 sualları (204 sual)' : 'Mühazirə sualları (367 sual)'}{' '}
            orijinal mətn üzrə təqdim edilir.
          </p>
        </div>
      </footer>
    </div>
  );
}
