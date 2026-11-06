import {
  QuestionsData,
  QuizQuestion,
  PreparedOption,
  RawQuestion,
  RawTopic,
  UserAnswers,
  QuizStats,
  ReviewFilter,
  SavedSettings,
  QuestionSetId,
} from '../types';

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

/**
 * Fisher-Yates (Knuth) shuffle algorithm that returns a new shuffled copy.
 */
export function fisherYatesShuffle<T>(items: readonly T[], randomFn: () => number = Math.random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(randomFn() * (i + 1));
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}

/**
 * Prepares questions by filtering topics, shuffling question order,
 * shuffling options within each question, preserving the correct answer identity,
 * and re-assigning letter labels (A, B, C, D, ...).
 */
export function prepareQuizQuestions(
  allQuestions: RawQuestion[],
  topics: RawTopic[],
  selectedTopicIds: number[],
  countLimit: number | 'all' = 'all',
  randomFn: () => number = Math.random
): QuizQuestion[] {
  const topicMap = new Map<number, string>();
  for (const t of topics) {
    topicMap.set(t.id, t.title);
  }

  // 1. Filter questions by selected topics
  const topicSet = new Set(selectedTopicIds);
  const filtered = allQuestions.filter((q) => topicSet.has(q.topic));

  // 2. Shuffle question order with Fisher-Yates
  const shuffledQuestions = fisherYatesShuffle(filtered, randomFn);

  // 3. Take slice if countLimit is set and valid
  const targetCount = countLimit === 'all' || countLimit <= 0 || countLimit > shuffledQuestions.length
    ? shuffledQuestions.length
    : countLimit;
  const sliced = shuffledQuestions.slice(0, targetCount);

  // 4. Transform each question: shuffle options and preserve correct identity
  return sliced.map((q, idx) => {
    // Raw options with their original identity and correctness flag
    const rawOptionObjects = q.options.map((optText, optIdx) => ({
      rawText: optText,
      isCorrect: optIdx === q.correct,
      rawIndex: optIdx,
    }));

    // Shuffle options using Fisher-Yates
    const shuffledOptions = fisherYatesShuffle(rawOptionObjects, randomFn);

    // Assign final options with new letter badges (A, B, C, ...)
    const preparedOptions: PreparedOption[] = shuffledOptions.map((opt, optIndex) => ({
      id: `q${q.id}_opt${opt.rawIndex}`,
      letter: OPTION_LETTERS[optIndex] || String.fromCharCode(65 + optIndex),
      text: opt.rawText,
      isCorrect: opt.isCorrect,
    }));

    return {
      id: idx + 1, // 1-based sequential quiz index
      originalId: q.id,
      src: q.src,
      topicId: q.topic,
      topicTitle: topicMap.get(q.topic) || `Mövzu ${q.topic}`,
      questionText: q.question,
      options: preparedOptions,
    };
  });
}

/**
 * Prepares a retry quiz from previously missed (wrong + unanswered) questions.
 */
export function prepareRetryQuizFromMissed(
  allQuestions: RawQuestion[],
  topics: RawTopic[],
  missedOriginalIds: number[],
  randomFn: () => number = Math.random
): QuizQuestion[] {
  const missedSet = new Set(missedOriginalIds);
  const filtered = allQuestions.filter((q) => missedSet.has(q.id));
  const topicMap = new Map<number, string>();
  for (const t of topics) {
    topicMap.set(t.id, t.title);
  }

  const shuffledQuestions = fisherYatesShuffle(filtered, randomFn);

  return shuffledQuestions.map((q, idx) => {
    const rawOptionObjects = q.options.map((optText, optIdx) => ({
      rawText: optText,
      isCorrect: optIdx === q.correct,
      rawIndex: optIdx,
    }));

    const shuffledOptions = fisherYatesShuffle(rawOptionObjects, randomFn);

    const preparedOptions: PreparedOption[] = shuffledOptions.map((opt, optIndex) => ({
      id: `retry_q${q.id}_opt${opt.rawIndex}`,
      letter: OPTION_LETTERS[optIndex] || String.fromCharCode(65 + optIndex),
      text: opt.rawText,
      isCorrect: opt.isCorrect,
    }));

    return {
      id: idx + 1,
      originalId: q.id,
      src: q.src,
      topicId: q.topic,
      topicTitle: topicMap.get(q.topic) || `Mövzu ${q.topic}`,
      questionText: q.question,
      options: preparedOptions,
    };
  });
}

/**
 * Calculate stats for a finished quiz.
 */
export function calculateQuizStats(questions: QuizQuestion[], userAnswers: UserAnswers): QuizStats {
  const total = questions.length;
  let correctCount = 0;
  let wrongCount = 0;
  let unansweredCount = 0;

  for (const q of questions) {
    const chosenOptionId = userAnswers[q.id];
    if (!chosenOptionId) {
      unansweredCount++;
    } else {
      const chosenOption = q.options.find((opt) => opt.id === chosenOptionId);
      if (chosenOption && chosenOption.isCorrect) {
        correctCount++;
      } else {
        wrongCount++;
      }
    }
  }

  const incorrectTotal = wrongCount + unansweredCount;
  const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;

  return {
    total,
    correctCount,
    wrongCount,
    unansweredCount,
    incorrectTotal,
    percentage,
  };
}

export interface ReviewItem {
  question: QuizQuestion;
  userAnswer?: PreparedOption;
  correctAnswer: PreparedOption;
  status: 'correct' | 'wrong' | 'unanswered';
}

/**
 * Get review items based on active filter.
 * Standard requirement: "A review list of all questions answered wrongly or left unanswered"
 * Filter tabs: "Hamısı" (all wrong + unanswered) / "Yanlış" / "Cavabsız"
 */
export function getReviewList(
  questions: QuizQuestion[],
  userAnswers: UserAnswers,
  filter: ReviewFilter = 'all'
): ReviewItem[] {
  const reviewItems: ReviewItem[] = [];

  for (const q of questions) {
    const chosenId = userAnswers[q.id];
    const correctAnswer = q.options.find((opt) => opt.isCorrect);
    if (!correctAnswer) continue; // safety

    if (!chosenId) {
      // Unanswered
      if (filter === 'all' || filter === 'unanswered') {
        reviewItems.push({
          question: q,
          correctAnswer,
          status: 'unanswered',
        });
      }
    } else {
      const chosenOption = q.options.find((opt) => opt.id === chosenId);
      if (chosenOption?.isCorrect) {
        // Correct - not included in errors review list
      } else {
        // Wrong
        if (filter === 'all' || filter === 'wrong') {
          reviewItems.push({
            question: q,
            userAnswer: chosenOption,
            correctAnswer,
            status: 'wrong',
          });
        }
      }
    }
  }

  return reviewItems;
}

const SETTINGS_KEY = 'mulki_mudafie_quiz_settings';

export function loadSavedSettings(defaultTopicIds: number[]): {
  questionSet: QuestionSetId;
  selectedTopicIds: number[];
  countLimit: number | 'all';
} {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const questionSet: QuestionSetId = parsed.questionSet === 'r25' ? 'r25' : 'lecture';
      const countLimit = parsed.countLimit === 'all' || typeof parsed.countLimit === 'number' ? parsed.countLimit : 'all';
      if (Array.isArray(parsed.selectedTopicIds) && parsed.selectedTopicIds.length > 0) {
        return {
          questionSet,
          selectedTopicIds: parsed.selectedTopicIds,
          countLimit,
        };
      }
      return {
        questionSet,
        selectedTopicIds: defaultTopicIds,
        countLimit,
      };
    }
  } catch (err) {
    // LocalStorage may be blocked or unavailable
    console.warn('LocalStorage unavailable:', err);
  }

  return {
    questionSet: 'lecture',
    selectedTopicIds: defaultTopicIds,
    countLimit: 'all',
  };
}

export function saveSettings(settings: SavedSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.warn('Unable to save settings to localStorage:', err);
  }
}
