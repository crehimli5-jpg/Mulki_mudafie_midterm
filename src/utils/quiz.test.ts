import test from 'node:test';
import assert from 'node:assert/strict';
import {
  fisherYatesShuffle,
  prepareQuizQuestions,
  calculateQuizStats,
  getReviewList,
  prepareRetryQuizFromMissed,
} from './quiz';
import { RawQuestion, RawTopic, UserAnswers } from '../types';

const mockTopics: RawTopic[] = [
  { id: 1, title: 'Mövzu 1 başlığı', count: 2 },
  { id: 2, title: 'Mövzu 2 başlığı', count: 2 },
];

const mockQuestions: RawQuestion[] = [
  {
    id: 101,
    src: 1,
    topic: 1,
    question: 'Sual 1 mətni?',
    options: ['Cavab A', 'Cavab B', 'Cavab C', 'Cavab D', 'Cavab E'],
    correct: 2, // 'Cavab C' is correct
  },
  {
    id: 102,
    src: 2,
    topic: 1,
    question: 'Sual 2 mətni?',
    options: ['Cavab 1', 'Cavab 2', 'Cavab 3', 'Cavab 4', 'Cavab 5', 'Cavab 6'],
    correct: 0, // 'Cavab 1' is correct (6 options test)
  },
  {
    id: 201,
    src: 3,
    topic: 2,
    question: 'Sual 3 mətni?',
    options: ['Cavab X', 'Cavab Y', 'Cavab Z'],
    correct: 1, // 'Cavab Y' is correct
  },
];

test('fisherYatesShuffle maintains all elements and length', () => {
  const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const shuffled = fisherYatesShuffle(original);
  assert.equal(shuffled.length, original.length);
  assert.deepEqual(new Set(shuffled), new Set(original));
});

test('prepareQuizQuestions filters by selected topics', () => {
  const preparedTopic1 = prepareQuizQuestions(mockQuestions, mockTopics, [1], 'all');
  assert.equal(preparedTopic1.length, 2);
  assert.equal(preparedTopic1.every((q) => q.topicId === 1), true);

  const preparedTopic2 = prepareQuizQuestions(mockQuestions, mockTopics, [2], 'all');
  assert.equal(preparedTopic2.length, 1);
  assert.equal(preparedTopic2[0].topicId, 2);
});

test('prepareQuizQuestions preserves correct answer identity after options shuffle', () => {
  // Run multiple iterations with random shuffles
  for (let i = 0; i < 20; i++) {
    const prepared = prepareQuizQuestions(mockQuestions, mockTopics, [1, 2], 'all');
    for (const q of prepared) {
      const originalRaw = mockQuestions.find((mq) => mq.id === q.originalId)!;
      const expectedCorrectText = originalRaw.options[originalRaw.correct];

      const correctPreparedOption = q.options.find((opt) => opt.isCorrect);
      assert.ok(correctPreparedOption, `Question ${q.id} must have a marked correct option`);
      assert.equal(correctPreparedOption?.text, expectedCorrectText);

      // Verify each option has a distinct letter A, B, C, D...
      const letters = q.options.map((opt) => opt.letter);
      assert.equal(letters[0], 'A');
      assert.equal(letters[1], 'B');
      assert.equal(letters[2], 'C');
      if (q.options.length >= 5) {
        assert.equal(letters[3], 'D');
        assert.equal(letters[4], 'E');
      }
      if (q.options.length >= 6) {
        assert.equal(letters[5], 'F');
      }
    }
  }
});

test('prepareQuizQuestions respects count limit', () => {
  const prepared = prepareQuizQuestions(mockQuestions, mockTopics, [1, 2], 2);
  assert.equal(prepared.length, 2);
});

test('calculateQuizStats correctly tabulates scores', () => {
  const prepared = prepareQuizQuestions(mockQuestions, mockTopics, [1, 2], 'all');
  // q1: correct, q2: wrong, q3: unanswered
  const userAnswers: UserAnswers = {};

  // Find correct option for question 1
  const q1Correct = prepared[0].options.find((o) => o.isCorrect)!;
  userAnswers[prepared[0].id] = q1Correct.id;

  // Find WRONG option for question 2
  const q2Wrong = prepared[1].options.find((o) => !o.isCorrect)!;
  userAnswers[prepared[1].id] = q2Wrong.id;

  // Leave question 3 unanswered

  const stats = calculateQuizStats(prepared, userAnswers);
  assert.equal(stats.total, 3);
  assert.equal(stats.correctCount, 1);
  assert.equal(stats.wrongCount, 1);
  assert.equal(stats.unansweredCount, 1);
  assert.equal(stats.incorrectTotal, 2);
  assert.equal(stats.percentage, 33); // 1/3 ~ 33%
});

test('getReviewList correctly extracts wrong and unanswered questions with filters', () => {
  const prepared = prepareQuizQuestions(mockQuestions, mockTopics, [1, 2], 'all');
  const userAnswers: UserAnswers = {};

  const q1Correct = prepared[0].options.find((o) => o.isCorrect)!;
  userAnswers[prepared[0].id] = q1Correct.id;

  const q2Wrong = prepared[1].options.find((o) => !o.isCorrect)!;
  userAnswers[prepared[1].id] = q2Wrong.id;

  // All failed (wrong + unanswered)
  const allReview = getReviewList(prepared, userAnswers, 'all');
  assert.equal(allReview.length, 2);

  // Wrong only
  const wrongReview = getReviewList(prepared, userAnswers, 'wrong');
  assert.equal(wrongReview.length, 1);
  assert.equal(wrongReview[0].status, 'wrong');
  assert.equal(wrongReview[0].question.id, prepared[1].id);

  // Unanswered only
  const unansweredReview = getReviewList(prepared, userAnswers, 'unanswered');
  assert.equal(unansweredReview.length, 1);
  assert.equal(unansweredReview[0].status, 'unanswered');
  assert.equal(unansweredReview[0].question.id, prepared[2].id);
});

test('prepareRetryQuizFromMissed builds reshuffled quiz for missed questions', () => {
  const retryQuestions = prepareRetryQuizFromMissed(mockQuestions, mockTopics, [102, 201]);
  assert.equal(retryQuestions.length, 2);
  const ids = retryQuestions.map((q) => q.originalId);
  assert.ok(ids.includes(102));
  assert.ok(ids.includes(201));
});

test('both datasets (questions.json and r25.json) have exact expected counts and valid options', async () => {
  const questionsData = await import('../data/questions.json', { with: { type: 'json' } });
  const r25Data = await import('../data/r25.json', { with: { type: 'json' } });

  // 1. Lecture set (questions.json): 367 questions, [54, 44, 54, 56, 63, 48, 48]
  assert.equal(questionsData.default.questions.length, 367);
  const lectureCounts = questionsData.default.topics.map((t: { count: number }) => t.count);
  assert.deepEqual(lectureCounts, [54, 44, 54, 56, 63, 48, 48]);

  // 2. R25 set (r25.json): 204 questions, [34, 31, 33, 22, 29, 23, 32]
  assert.equal(r25Data.default.questions.length, 204);
  const r25Counts = r25Data.default.topics.map((t: { count: number }) => t.count);
  assert.deepEqual(r25Counts, [34, 31, 33, 22, 29, 23, 32]);

  // Verify answer keys are within range
  for (const q of questionsData.default.questions) {
    assert.ok(q.correct >= 0 && q.correct < q.options.length, `q ${q.id} correct option out of bounds`);
  }
  for (const q of r25Data.default.questions) {
    assert.ok(q.correct >= 0 && q.correct < q.options.length, `r25 q ${q.id} correct option out of bounds`);
  }
});
