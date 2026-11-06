export interface RawTopic {
  id: number;
  title: string;
  count: number;
}

export interface RawQuestion {
  id: number;
  src: number;
  topic: number;
  question: string;
  options: string[];
  correct: number; // 0-based index in raw options
}

export interface QuestionsData {
  topics: RawTopic[];
  questions: RawQuestion[];
}

export interface PreparedOption {
  id: string; // unique ID or stable identifier
  letter: string; // A, B, C, D, E, F...
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: number;
  originalId: number;
  src: number;
  topicId: number;
  topicTitle: string;
  questionText: string;
  options: PreparedOption[];
}

export type UserAnswers = Record<number, string>; // questionId -> optionId chosen (or undefined if not answered)

export interface QuizStats {
  total: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  incorrectTotal: number; // wrong + unanswered
  percentage: number;
}

export type ReviewFilter = 'all' | 'wrong' | 'unanswered';

export type QuestionSetId = 'lecture' | 'r25';

export interface SavedSettings {
  questionSet?: QuestionSetId;
  selectedTopicIds: number[];
  countLimit: number | 'all';
}
